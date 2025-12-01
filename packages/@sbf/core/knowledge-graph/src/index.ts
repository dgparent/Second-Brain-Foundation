/**
 * @sbf/core-knowledge-graph
 * Graph database and relationship management
 */

import { Entity, Relationship } from '@sbf/shared';
import { EventEmitter } from 'eventemitter3';
import { randomUUID } from 'crypto';

export interface GraphQuery {
  startEntityUid?: string;
  relationshipTypes?: string[];
  maxDepth?: number;
  direction?: 'outbound' | 'inbound' | 'both';
}

export interface GraphNode {
  entity: Entity;
  relationships: Relationship[];
  depth: number;
}

export interface StoredRelationship extends Relationship {
  uid: string;
}

export interface GraphEvents {
  'relationship:created': (relationship: StoredRelationship) => void;
  'relationship:deleted': (relationshipUid: string) => void;
  'graph:updated': () => void;
}

export class KnowledgeGraph extends EventEmitter<GraphEvents> {
  private relationships: Map<string, StoredRelationship> = new Map();
  private entityRelationships: Map<string, Set<string>> = new Map();

  /**
   * Get all relationships in the graph
   */
  getAllRelationships(): StoredRelationship[] {
    return Array.from(this.relationships.values());
  }

  /**
   * Add a relationship between two entities
   */
  async addRelationship(relationship: Relationship): Promise<StoredRelationship> {
    const storedRel: StoredRelationship = {
      ...relationship,
      uid: randomUUID(),
    };
    
    this.relationships.set(storedRel.uid, storedRel);

    // Index by source entity
    if (!this.entityRelationships.has(storedRel.source_uid)) {
      this.entityRelationships.set(storedRel.source_uid, new Set());
    }
    this.entityRelationships.get(storedRel.source_uid)!.add(storedRel.uid);

    // Index by target entity
    if (!this.entityRelationships.has(storedRel.target_uid)) {
      this.entityRelationships.set(storedRel.target_uid, new Set());
    }
    this.entityRelationships.get(storedRel.target_uid)!.add(storedRel.uid);

    this.emit('relationship:created', storedRel);
    this.emit('graph:updated');

    return storedRel;
  }

  /**
   * Remove a relationship by UID
   */
  async removeRelationship(relationshipUid: string): Promise<boolean> {
    const relationship = this.relationships.get(relationshipUid);
    if (!relationship) {
      return false;
    }

    this.relationships.delete(relationshipUid);
    this.entityRelationships.get(relationship.source_uid)?.delete(relationshipUid);
    this.entityRelationships.get(relationship.target_uid)?.delete(relationshipUid);

    this.emit('relationship:deleted', relationshipUid);
    this.emit('graph:updated');

    return true;
  }

  /**
   * Get all relationships for an entity
   */
  async getEntityRelationships(entityUid: string, direction: 'outbound' | 'inbound' | 'both' = 'both'): Promise<StoredRelationship[]> {
    const relationshipUids = this.entityRelationships.get(entityUid) || new Set();
    const relationships: StoredRelationship[] = [];

    for (const uid of relationshipUids) {
      const relationship = this.relationships.get(uid);
      if (!relationship) continue;

      const isOutbound = relationship.source_uid === entityUid;
      const isInbound = relationship.target_uid === entityUid;

      if (direction === 'both' || (direction === 'outbound' && isOutbound) || (direction === 'inbound' && isInbound)) {
        relationships.push(relationship);
      }
    }

    return relationships;
  }

  /**
   * Query the graph starting from an entity
   */
  async queryGraph(query: GraphQuery, entities: Map<string, Entity>): Promise<GraphNode[]> {
    const { startEntityUid, relationshipTypes, maxDepth = 3, direction = 'both' } = query;

    if (!startEntityUid) {
      return [];
    }

    const visited = new Set<string>();
    const result: GraphNode[] = [];
    const queue: { entityUid: string; depth: number }[] = [{ entityUid: startEntityUid, depth: 0 }];

    while (queue.length > 0) {
      const { entityUid, depth } = queue.shift()!;

      if (visited.has(entityUid) || depth > maxDepth) {
        continue;
      }

      visited.add(entityUid);

      const entity = entities.get(entityUid);
      if (!entity) continue;

      const relationships = await this.getEntityRelationships(entityUid, direction);
      const filteredRelationships = relationshipTypes
        ? relationships.filter(r => relationshipTypes.includes(r.type))
        : relationships;

      result.push({
        entity,
        relationships: filteredRelationships,
        depth,
      });

      // Add connected entities to queue
      for (const rel of filteredRelationships) {
        const nextEntityUid = rel.source_uid === entityUid ? rel.target_uid : rel.source_uid;
        if (!visited.has(nextEntityUid)) {
          queue.push({ entityUid: nextEntityUid, depth: depth + 1 });
        }
      }
    }

    return result;
  }

  /**
   * Find shortest path between two entities
   */
  async findPath(startUid: string, endUid: string, entities: Map<string, Entity>): Promise<GraphNode[] | null> {
    const visited = new Set<string>();
    const queue: { entityUid: string; path: string[] }[] = [{ entityUid: startUid, path: [startUid] }];

    while (queue.length > 0) {
      const { entityUid, path } = queue.shift()!;

      if (entityUid === endUid) {
        // Build result from path
        const result: GraphNode[] = [];
        for (let i = 0; i < path.length; i++) {
          const entity = entities.get(path[i]);
          if (!entity) continue;

          const relationships = await this.getEntityRelationships(path[i]);
          result.push({ entity, relationships, depth: i });
        }
        return result;
      }

      if (visited.has(entityUid)) {
        continue;
      }

      visited.add(entityUid);

      const relationships = await this.getEntityRelationships(entityUid);
      for (const rel of relationships) {
        const nextUid = rel.source_uid === entityUid ? rel.target_uid : rel.source_uid;
        if (!visited.has(nextUid)) {
          queue.push({ entityUid: nextUid, path: [...path, nextUid] });
        }
      }
    }

    return null;
  }

  /**
   * Get statistics about the graph
   */
  getStats() {
    return {
      totalRelationships: this.relationships.size,
      totalEntities: this.entityRelationships.size,
      relationshipTypes: new Set(Array.from(this.relationships.values()).map(r => r.type)).size,
    };
  }
}

export * from './types';
