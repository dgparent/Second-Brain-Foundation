/**
 * Entity Tools - CRUD operations for SBF entities
 * 
 * Provides tools for agents to interact with the vault's entity system.
 * Tools are registered with the ToolManager and can be called by agents.
 */

import { createTool } from '../../schemas/tool';
import { ToolHandler } from '../../managers/tool-manager';
import { EntityFileManager } from '../../../entities/entity-file-manager';
import { Entity, EntityType } from '../../../types';

/**
 * Create entity tool
 * 
 * Allows the agent to create new entities in the vault.
 */
export function createCreateEntityTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'create_entity',
    'Create a new entity (topic, project, person, place, or daily note) in the vault',
    {
      type: {
        type: 'string',
        description: 'Entity type (topic, project, person, place, daily-note)',
        required: true,
        enum: ['topic', 'project', 'person', 'place', 'daily-note'],
      },
      title: {
        type: 'string',
        description: 'Entity title',
        required: true,
      },
      content: {
        type: 'string',
        description: 'Entity content (markdown)',
        required: false,
      },
      tags: {
        type: 'array',
        description: 'Tags for the entity',
        required: false,
        items: { type: 'string' },
      },
      aliases: {
        type: 'array',
        description: 'Alternative names for the entity',
        required: false,
        items: { type: 'string' },
      },
    },
    {
      tags: ['entity', 'crud', 'create'],
      returnCharLimit: 1000,
    }
  );

  const handler: ToolHandler = async (params) => {
    try {
      const uid = await entityManager.create({
        type: params.type as EntityType,
        title: params.title,
        content: params.content || '',
        tags: params.tags || [],
        aliases: params.aliases || [],
      });

      return {
        uid,
        type: params.type,
        title: params.title,
        message: `Created ${params.type}: ${params.title}`,
      };
    } catch (error) {
      throw new Error(`Failed to create entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { tool, handler };
}

/**
 * Read entity tool
 * 
 * Retrieves an entity by its UID.
 */
export function createReadEntityTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'read_entity',
    'Retrieve an entity by its UID',
    {
      uid: {
        type: 'string',
        description: 'Entity UID (e.g., topic-machine-learning-001)',
        required: true,
      },
    },
    {
      tags: ['entity', 'crud', 'read'],
      returnCharLimit: 5000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const entity = await entityManager.read(params.uid);
    
    if (!entity) {
      throw new Error(`Entity not found: ${params.uid}`);
    }

    // Return relevant entity data
    return {
      uid: entity.uid,
      type: entity.type,
      title: entity.title,
      content: entity.content,
      tags: entity.tags,
      aliases: entity.aliases,
      created: entity.created,
      updated: entity.updated,
      relationships: entity.rel,
    };
  };

  return { tool, handler };
}

/**
 * Update entity tool
 * 
 * Updates an existing entity's fields.
 */
export function createUpdateEntityTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'update_entity',
    'Update an existing entity',
    {
      uid: {
        type: 'string',
        description: 'Entity UID to update',
        required: true,
      },
      title: {
        type: 'string',
        description: 'New title (optional)',
        required: false,
      },
      content: {
        type: 'string',
        description: 'New content (optional)',
        required: false,
      },
      tags: {
        type: 'array',
        description: 'New tags (optional, replaces existing)',
        required: false,
        items: { type: 'string' },
      },
    },
    {
      tags: ['entity', 'crud', 'update'],
      returnCharLimit: 500,
    }
  );

  const handler: ToolHandler = async (params) => {
    const { uid, ...updates } = params;

    // Build update object (only include provided fields)
    const entityUpdates: Partial<Entity> = {};
    if (updates.title) entityUpdates.title = updates.title;
    if (updates.content !== undefined) entityUpdates.content = updates.content;
    if (updates.tags) entityUpdates.tags = updates.tags;

    try {
      await entityManager.update(uid, entityUpdates);
      
      return {
        uid,
        updated_fields: Object.keys(entityUpdates),
        message: `Updated entity: ${uid}`,
      };
    } catch (error) {
      throw new Error(`Failed to update entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { tool, handler };
}

/**
 * Delete entity tool
 * 
 * Deletes an entity from the vault.
 */
export function createDeleteEntityTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'delete_entity',
    'Delete an entity from the vault',
    {
      uid: {
        type: 'string',
        description: 'Entity UID to delete',
        required: true,
      },
    },
    {
      tags: ['entity', 'crud', 'delete'],
      returnCharLimit: 500,
    }
  );

  const handler: ToolHandler = async (params) => {
    try {
      await entityManager.delete(params.uid);
      
      return {
        uid: params.uid,
        message: `Deleted entity: ${params.uid}`,
      };
    } catch (error) {
      throw new Error(`Failed to delete entity: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return { tool, handler };
}

/**
 * List entities tool
 * 
 * Lists entities, optionally filtered by type.
 */
export function createListEntitiesTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'list_entities',
    'List entities in the vault, optionally filtered by type',
    {
      type: {
        type: 'string',
        description: 'Filter by entity type (optional)',
        required: false,
        enum: ['topic', 'project', 'person', 'place', 'daily-note'],
      },
      limit: {
        type: 'number',
        description: 'Maximum number of entities to return (default: 50)',
        required: false,
      },
    },
    {
      tags: ['entity', 'crud', 'list'],
      returnCharLimit: 10000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const type = params.type as EntityType | undefined;
    const limit = params.limit || 50;

    const entities = await entityManager.list(type);

    // Limit results
    const limitedEntities = entities.slice(0, limit);

    return {
      count: limitedEntities.length,
      total: entities.length,
      entities: limitedEntities.map(e => ({
        uid: e.uid,
        type: e.type,
        title: e.title,
        tags: e.tags,
        created: e.created,
        updated: e.updated,
      })),
    };
  };

  return { tool, handler };
}

/**
 * Search entities tool
 * 
 * Search for entities by title or content.
 */
export function createSearchEntitiesTool(entityManager: EntityFileManager) {
  const tool = createTool(
    'search_entities',
    'Search for entities by title or content',
    {
      query: {
        type: 'string',
        description: 'Search query',
        required: true,
      },
      type: {
        type: 'string',
        description: 'Filter by entity type (optional)',
        required: false,
        enum: ['topic', 'project', 'person', 'place', 'daily-note'],
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20)',
        required: false,
      },
    },
    {
      tags: ['entity', 'search'],
      returnCharLimit: 10000,
    }
  );

  const handler: ToolHandler = async (params) => {
    const limit = params.limit || 20;
    const type = params.type as EntityType | undefined;

    // Get all entities (or filtered by type)
    const allEntities = await entityManager.list(type);

    // Simple search: filter by title or content containing query
    const query = params.query.toLowerCase();
    const results = allEntities.filter(e => 
      e.title.toLowerCase().includes(query) ||
      (e.content && e.content.toLowerCase().includes(query)) ||
      e.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // Limit results
    const limitedResults = results.slice(0, limit);

    return {
      query: params.query,
      count: limitedResults.length,
      total: results.length,
      results: limitedResults.map(e => ({
        uid: e.uid,
        type: e.type,
        title: e.title,
        tags: e.tags,
        excerpt: e.content ? e.content.substring(0, 200) : '',
      })),
    };
  };

  return { tool, handler };
}

/**
 * Register all entity tools
 * 
 * Helper function to register all entity CRUD tools at once.
 */
export function registerEntityTools(
  toolManager: any, // ToolManager type
  entityManager: EntityFileManager
): void {
  const tools = [
    createCreateEntityTool(entityManager),
    createReadEntityTool(entityManager),
    createUpdateEntityTool(entityManager),
    createDeleteEntityTool(entityManager),
    createListEntitiesTool(entityManager),
    createSearchEntitiesTool(entityManager),
  ];

  for (const { tool, handler } of tools) {
    toolManager.registerTool(tool, handler);
  }
}
