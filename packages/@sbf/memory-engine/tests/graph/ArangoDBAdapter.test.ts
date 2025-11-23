import { ArangoDBAdapter } from '../../src/graph/ArangoDBAdapter';
import { Entity, Relationship, LifecycleState } from '@sbf/shared';

describe('ArangoDBAdapter', () => {
  let adapter: ArangoDBAdapter;
  
  beforeAll(async () => {
    adapter = new ArangoDBAdapter({
      url: process.env.ARANGO_URL || 'http://localhost:8529',
      database: 'sbf_test',
      username: process.env.ARANGO_USER || 'root',
      password: process.env.ARANGO_PASSWORD || '',
    });
    
    await adapter.initialize();
  });

  afterAll(async () => {
    await adapter.close();
  });

  describe('Connection', () => {
    it('should successfully connect to ArangoDB', async () => {
      const isConnected = await adapter.testConnection();
      expect(isConnected).toBe(true);
    });
  });

  describe('Entity CRUD Operations', () => {
    const testEntity: Entity = {
      uid: 'test-entity-1',
      name: 'Test Entity',
      type: 'concept',
      lifecycle: {
        state: LifecycleState.ACTIVE,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      attributes: {
        description: 'A test entity',
      },
      metadata: {
        created_by: 'test-user',
        tags: ['test'],
      },
      privacy: {
        export_allowed: true,
        share_allowed: false,
      },
    };

    it('should create an entity', async () => {
      const created = await adapter.createEntity(testEntity);
      expect(created.uid).toBe(testEntity.uid);
      expect(created.name).toBe(testEntity.name);
    });

    it('should retrieve an entity by UID', async () => {
      const retrieved = await adapter.getEntity('test-entity-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.name).toBe('Test Entity');
    });

    it('should update an entity', async () => {
      const updated = await adapter.updateEntity('test-entity-1', {
        name: 'Updated Test Entity',
      });
      expect(updated?.name).toBe('Updated Test Entity');
    });

    it('should delete an entity', async () => {
      const deleted = await adapter.deleteEntity('test-entity-1');
      expect(deleted).toBe(true);
      
      const retrieved = await adapter.getEntity('test-entity-1');
      expect(retrieved).toBeNull();
    });
  });

  describe('Relationship Operations', () => {
    const entity1: Entity = {
      uid: 'entity-1',
      name: 'Entity 1',
      type: 'person',
      lifecycle: {
        state: LifecycleState.ACTIVE,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      attributes: {},
      metadata: {},
      privacy: { export_allowed: true, share_allowed: false },
    };

    const entity2: Entity = {
      uid: 'entity-2',
      name: 'Entity 2',
      type: 'organization',
      lifecycle: {
        state: LifecycleState.ACTIVE,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      attributes: {},
      metadata: {},
      privacy: { export_allowed: true, share_allowed: false },
    };

    const relationship: Relationship = {
      from: 'entity-1',
      to: 'entity-2',
      type: 'works_at',
      metadata: {
        since: '2024-01-01',
      },
    };

    beforeEach(async () => {
      await adapter.createEntity(entity1);
      await adapter.createEntity(entity2);
    });

    afterEach(async () => {
      await adapter.deleteEntity('entity-1');
      await adapter.deleteEntity('entity-2');
    });

    it('should create a relationship', async () => {
      const created = await adapter.createRelationship(relationship);
      expect(created.from).toBe('entity-1');
      expect(created.to).toBe('entity-2');
      expect(created.type).toBe('works_at');
    });

    it('should retrieve relationships', async () => {
      await adapter.createRelationship(relationship);
      const relationships = await adapter.getRelationships('entity-1', 'outbound');
      expect(relationships.length).toBeGreaterThan(0);
      expect(relationships[0].type).toBe('works_at');
    });
  });

  describe('Graph Traversal', () => {
    it('should traverse the graph from a starting point', async () => {
      const startEntity: Entity = {
        uid: 'start-entity',
        name: 'Start Entity',
        type: 'concept',
        lifecycle: {
          state: LifecycleState.ACTIVE,
          created: new Date().toISOString(),
          updated: new Date().toISOString(),
        },
        attributes: {},
        metadata: {},
        privacy: { export_allowed: true, share_allowed: false },
      };

      await adapter.createEntity(startEntity);
      
      const results = await adapter.traverseGraph({
        startUid: 'start-entity',
        depth: 2,
        direction: 'any',
      });

      expect(Array.isArray(results)).toBe(true);
      
      await adapter.deleteEntity('start-entity');
    });
  });

  describe('Search Operations', () => {
    const searchEntity: Entity = {
      uid: 'search-entity-1',
      name: 'Searchable Entity',
      type: 'concept',
      lifecycle: {
        state: LifecycleState.ACTIVE,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
      attributes: {},
      metadata: {},
      privacy: { export_allowed: true, share_allowed: false },
    };

    beforeEach(async () => {
      await adapter.createEntity(searchEntity);
    });

    afterEach(async () => {
      await adapter.deleteEntity('search-entity-1');
    });

    it('should find entities by type', async () => {
      const results = await adapter.findByType('concept');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(e => e.uid === 'search-entity-1')).toBe(true);
    });

    it('should find entities by lifecycle state', async () => {
      const results = await adapter.findByLifecycleState(LifecycleState.ACTIVE);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should search entities by name', async () => {
      const results = await adapter.searchByName('Searchable');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(e => e.name === 'Searchable Entity')).toBe(true);
    });
  });
});
