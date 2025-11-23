import { Database, aql } from 'arangojs';
import { Entity, Relationship } from '@sbf/shared';

export interface ArangoDBConfig {
  url?: string;
  database?: string;
  username?: string;
  password?: string;
}

export interface GraphQuery {
  startUid?: string;
  depth?: number;
  direction?: 'outbound' | 'inbound' | 'any';
  relationshipTypes?: string[];
  entityTypes?: string[];
}

export class ArangoDBAdapter {
  private db: Database;
  private readonly entitiesCollection = 'entities';
  private readonly relationshipsCollection = 'relationships';
  private readonly graphName = 'sbf_knowledge_graph';

  constructor(config: ArangoDBConfig = {}) {
    this.db = new Database({
      url: config.url || 'http://localhost:8529',
      auth: {
        username: config.username || 'root',
        password: config.password || '',
      },
    });

    if (config.database) {
      this.db = this.db.database(config.database);
    }
  }

  async initialize(): Promise<void> {
    try {
      // Database should already exist, just ensure collections are set up
      const collections = await this.db.listCollections();
      const collectionNames = collections.map(c => c.name);

      if (!collectionNames.includes(this.entitiesCollection)) {
        await this.db.createCollection(this.entitiesCollection);
      }

      if (!collectionNames.includes(this.relationshipsCollection)) {
        await this.db.createEdgeCollection(this.relationshipsCollection);
      }

      const graphs = await this.db.listGraphs();
      const graphExists = graphs.some(g => g._key === this.graphName);

      if (!graphExists) {
        await this.db.createGraph(this.graphName, [
          {
            collection: this.relationshipsCollection,
            from: [this.entitiesCollection],
            to: [this.entitiesCollection],
          },
        ]);
      }

      await this.createIndexes();
    } catch (error) {
      console.error('Failed to initialize ArangoDB:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    const entitiesCol = this.db.collection(this.entitiesCollection);
    
    await entitiesCol.ensureIndex({
      type: 'persistent',
      fields: ['uid'],
      unique: true,
    });

    await entitiesCol.ensureIndex({
      type: 'persistent',
      fields: ['type'],
    });

    await entitiesCol.ensureIndex({
      type: 'persistent',
      fields: ['title'],
    });

    await entitiesCol.ensureIndex({
      type: 'persistent',
      fields: ['lifecycle.state'],
    });
  }

  async createEntity(entity: Entity): Promise<Entity> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      await collection.save({
        _key: entity.uid,
        ...entity,
      });
      return entity;
    } catch (error) {
      console.error('Failed to create entity in ArangoDB:', error);
      throw error;
    }
  }

  async getEntity(uid: string): Promise<Entity | null> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      const doc = await collection.document(uid);
      const { _key, _id, _rev, ...entity } = doc;
      return entity as Entity;
    } catch (error) {
      if ((error as any).code === 404) {
        return null;
      }
      console.error('Failed to get entity from ArangoDB:', error);
      throw error;
    }
  }

  async updateEntity(uid: string, updates: Partial<Entity>): Promise<Entity | null> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      const doc = await collection.update(uid, updates, { returnNew: true });
      const { _key, _id, _rev, ...entity } = doc.new;
      return entity as Entity;
    } catch (error) {
      console.error('Failed to update entity in ArangoDB:', error);
      throw error;
    }
  }

  async deleteEntity(uid: string): Promise<boolean> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      await collection.remove(uid);
      
      await this.db.query(aql`
        FOR rel IN ${this.db.collection(this.relationshipsCollection)}
        FILTER rel.from == ${uid} OR rel.to == ${uid}
        REMOVE rel IN ${this.db.collection(this.relationshipsCollection)}
      `);
      
      return true;
    } catch (error) {
      console.error('Failed to delete entity from ArangoDB:', error);
      return false;
    }
  }

  async createRelationship(relationship: Relationship): Promise<Relationship> {
    const collection = this.db.collection(this.relationshipsCollection);
    
    try {
      const edgeData = {
        _from: `${this.entitiesCollection}/${relationship.source_uid}`,
        _to: `${this.entitiesCollection}/${relationship.target_uid}`,
        ...relationship,
      };
      
      await collection.save(edgeData);
      return relationship;
    } catch (error) {
      console.error('Failed to create relationship in ArangoDB:', error);
      throw error;
    }
  }

  async getRelationships(entityUid: string, direction: 'outbound' | 'inbound' | 'any' = 'any'): Promise<Relationship[]> {
    try {
      let query;
      const entityRef = `${this.entitiesCollection}/${entityUid}`;
      
      if (direction === 'outbound') {
        query = aql`
          FOR rel IN ${this.db.collection(this.relationshipsCollection)}
          FILTER rel._from == ${entityRef}
          RETURN rel
        `;
      } else if (direction === 'inbound') {
        query = aql`
          FOR rel IN ${this.db.collection(this.relationshipsCollection)}
          FILTER rel._to == ${entityRef}
          RETURN rel
        `;
      } else {
        query = aql`
          FOR rel IN ${this.db.collection(this.relationshipsCollection)}
          FILTER rel._from == ${entityRef} OR rel._to == ${entityRef}
          RETURN rel
        `;
      }
      
      const cursor = await this.db.query(query);
      const results = await cursor.all();
      
      return results.map((doc: any) => {
        const { _key, _id, _rev, _from, _to, ...relationship } = doc;
        return relationship as Relationship;
      });
    } catch (error) {
      console.error('Failed to get relationships from ArangoDB:', error);
      return [];
    }
  }

  async traverseGraph(query: GraphQuery): Promise<Entity[]> {
    try {
      if (!query.startUid) {
        throw new Error('Start UID is required for graph traversal');
      }

      const depth = query.depth || 2;
      const direction = query.direction || 'any';
      const startVertex = `${this.entitiesCollection}/${query.startUid}`;

      let aqlQuery = aql`
        FOR vertex, edge, path IN 1..${depth}
        ${direction === 'outbound' ? aql`OUTBOUND` : direction === 'inbound' ? aql`INBOUND` : aql`ANY`}
        ${startVertex}
        GRAPH ${this.graphName}
      `;

      if (query.relationshipTypes && query.relationshipTypes.length > 0) {
        aqlQuery = aql`${aqlQuery}
          FILTER edge.type IN ${query.relationshipTypes}
        `;
      }

      if (query.entityTypes && query.entityTypes.length > 0) {
        aqlQuery = aql`${aqlQuery}
          FILTER vertex.type IN ${query.entityTypes}
        `;
      }

      aqlQuery = aql`${aqlQuery}
        RETURN DISTINCT vertex
      `;

      const cursor = await this.db.query(aqlQuery);
      const results = await cursor.all();
      
      return results.map((doc: any) => {
        const { _key, _id, _rev, ...entity } = doc;
        return entity as Entity;
      });
    } catch (error) {
      console.error('Failed to traverse graph in ArangoDB:', error);
      return [];
    }
  }

  async findByType(type: string): Promise<Entity[]> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      const cursor = await this.db.query(aql`
        FOR entity IN ${collection}
        FILTER entity.type == ${type}
        RETURN entity
      `);
      
      const results = await cursor.all();
      return results.map((doc: any) => {
        const { _key, _id, _rev, ...entity } = doc;
        return entity as Entity;
      });
    } catch (error) {
      console.error('Failed to find entities by type in ArangoDB:', error);
      return [];
    }
  }

  async findByLifecycleState(state: string): Promise<Entity[]> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      const cursor = await this.db.query(aql`
        FOR entity IN ${collection}
        FILTER entity.lifecycle.state == ${state}
        RETURN entity
      `);
      
      const results = await cursor.all();
      return results.map((doc: any) => {
        const { _key, _id, _rev, ...entity } = doc;
        return entity as Entity;
      });
    } catch (error) {
      console.error('Failed to find entities by lifecycle state in ArangoDB:', error);
      return [];
    }
  }

  async searchByName(searchTerm: string): Promise<Entity[]> {
    const collection = this.db.collection(this.entitiesCollection);
    
    try {
      const cursor = await this.db.query(aql`
        FOR entity IN FULLTEXT(${collection}, 'name', ${searchTerm})
        RETURN entity
      `);
      
      const results = await cursor.all();
      return results.map((doc: any) => {
        const { _key, _id, _rev, ...entity } = doc;
        return entity as Entity;
      });
    } catch (error) {
      console.error('Failed to search entities by name in ArangoDB:', error);
      return [];
    }
  }

  async close(): Promise<void> {
    await this.db.close();
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.db.version();
      return true;
    } catch (error) {
      console.error('ArangoDB connection test failed:', error);
      return false;
    }
  }
}
