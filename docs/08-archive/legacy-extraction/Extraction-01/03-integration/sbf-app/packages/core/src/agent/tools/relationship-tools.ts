/**
 * Relationship Tools - Create and query relationships between entities
 * 
 * Provides tools for agents to create and search entity relationships.
 */

import { createTool } from '../../schemas/tool';
import { ToolHandler } from '../../managers/tool-manager';
import { EntityFileManager } from '../../../entities/entity-file-manager';

/**
 * Create relationship tool
 * 
 * Creates a typed relationship between two entities.
 */
export function createCreateRelationshipTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'create_relationship',
    'Create a typed relationship between two entities',
    {
      source_uid: {
        type: 'string',
        description: 'Source entity UID',
        required: true,
      },
      target_uid: {
        type: 'string',
        description: 'Target entity UID',
        required: true,
      },
      relationship_type: {
        type: 'string',
        description: 'Type of relationship (informs, uses, related_to, depends_on, part_of, etc.)',
        required: true,
      },
      bidirectional: {
        type: 'boolean',
        description: 'Whether to create the reverse relationship as well (default: false)',
        required: false,
      },
    },
    {
      tags: ['relationship', 'graph'],
      returnCharLimit: 1000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const { source_uid, target_uid, relationship_type, bidirectional } = params;

    try {
      // Read source entity
      const sourceEntity = await entityManager.read(source_uid);
      if (!sourceEntity) {
        throw new Error(`Source entity not found: ${source_uid}`);
      }

      // Read target entity to verify it exists
      const targetEntity = await entityManager.read(target_uid);
      if (!targetEntity) {
        throw new Error(`Target entity not found: ${target_uid}`);
      }

      // Add relationship to source
      const existingRels = sourceEntity.rel || [];
      const newRel = {
        type: relationship_type,
        target: target_uid,
      };

      // Check if relationship already exists
      const alreadyExists = existingRels.some(
        r => r.type === relationship_type && r.target === target_uid
      );

      if (alreadyExists) {
        return {
          source_uid,
          target_uid,
          relationship_type,
          message: 'Relationship already exists',
          created: false,
        };
      }

      // Update source entity
      await entityManager.update(source_uid, {
        rel: [...existingRels, newRel],
      });

      // Create reverse relationship if bidirectional
      if (bidirectional) {
        const targetRels = targetEntity.rel || [];
        const reverseRel = {
          type: relationship_type,
          target: source_uid,
        };

        const reverseExists = targetRels.some(
          r => r.type === relationship_type && r.target === source_uid
        );

        if (!reverseExists) {
          await entityManager.update(target_uid, {
            rel: [...targetRels, reverseRel],
          });
        }
      }

      return {
        source_uid,
        target_uid,
        relationship_type,
        bidirectional: bidirectional || false,
        message: `Created relationship: ${source_uid} --[${relationship_type}]--> ${target_uid}`,
        created: true,
      };
    } catch (error) {
      throw new Error(`Failed to create relationship: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { tool, handler };
}

/**
 * Get entity relationships tool
 * 
 * Retrieves all relationships for an entity.
 */
export function createGetRelationshipsTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'get_relationships',
    'Get all relationships for an entity, optionally filtered by type',
    {
      uid: {
        type: 'string',
        description: 'Entity UID',
        required: true,
      },
      relationship_type: {
        type: 'string',
        description: 'Filter by relationship type (optional)',
        required: false,
      },
    },
    {
      tags: ['relationship', 'graph', 'query'],
      returnCharLimit: 5000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const entity = await entityManager.read(params.uid);
    
    if (!entity) {
      throw new Error(`Entity not found: ${params.uid}`);
    }

    let relationships = entity.rel || [];

    // Filter by type if provided
    if (params.relationship_type) {
      relationships = relationships.filter(
        r => r.type === params.relationship_type
      );
    }

    // Get target entity details
    const relationshipsWithDetails = await Promise.all(
      relationships.map(async (rel) => {
        const target = await entityManager.read(rel.target);
        return {
          type: rel.type,
          target_uid: rel.target,
          target_title: target?.title || 'Unknown',
          target_type: target?.type || 'Unknown',
        };
      })
    );

    return {
      uid: params.uid,
      count: relationshipsWithDetails.length,
      relationships: relationshipsWithDetails,
    };
  };

  return { tool, handler };
}

/**
 * Find related entities tool
 * 
 * Finds entities related to a given entity through relationships.
 */
export function createFindRelatedEntitiesTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'find_related_entities',
    'Find entities related to a given entity through any relationship',
    {
      uid: {
        type: 'string',
        description: 'Entity UID to find relationships for',
        required: true,
      },
      max_depth: {
        type: 'number',
        description: 'Maximum relationship depth to traverse (1-3, default: 1)',
        required: false,
      },
    },
    {
      tags: ['relationship', 'graph', 'query', 'discovery'],
      returnCharLimit: 10000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const maxDepth = Math.min(params.max_depth || 1, 3); // Limit to 3 for safety
    const visited = new Set<string>();
    const relatedEntities: Array<{
      uid: string;
      title: string;
      type: string;
      depth: number;
      relationship: string;
    }> = [];

    // Recursive function to traverse relationships
    const traverse = async (uid: string, depth: number) => {
      if (depth > maxDepth || visited.has(uid)) {
        return;
      }

      visited.add(uid);

      const entity = await entityManager.read(uid);
      if (!entity) return;

      const relationships = entity.rel || [];

      for (const rel of relationships) {
        if (!visited.has(rel.target)) {
          const target = await entityManager.read(rel.target);
          if (target) {
            relatedEntities.push({
              uid: target.uid,
              title: target.title,
              type: target.type,
              depth,
              relationship: rel.type,
            });

            // Recurse if we haven't hit max depth
            if (depth < maxDepth) {
              await traverse(rel.target, depth + 1);
            }
          }
        }
      }
    };

    await traverse(params.uid, 1);

    return {
      source_uid: params.uid,
      max_depth: maxDepth,
      count: relatedEntities.length,
      related_entities: relatedEntities,
    };
  };

  return { tool, handler };
}

/**
 * Register all relationship tools
 */
export function registerRelationshipTools(
  toolManager: any, // ToolManager type
  entityManager: EntityFileManager
): void {
  const tools = [
    createCreateRelationshipTool(entityManager),
    createGetRelationshipsTool(entityManager),
    createFindRelatedEntitiesTool(entityManager),
  ];

  for (const { tool, handler } of tools) {
    toolManager.registerTool(tool, handler);
  }
}
