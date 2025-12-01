/**
 * Memory Engine
 * Main class that orchestrates storage, lifecycle, and graph operations
 */

import EventEmitter from 'eventemitter3';
import {
  Entity,
  VaultOptions,
  VaultScanResult,
  OperationResult,
  MemoryEngineHooks,
  LifecycleState,
  EntityEvent
} from './types';
import { VaultAdapter } from './storage/VaultAdapter';
import { LifecycleEngine } from './lifecycle/LifecycleEngine';
import { computeAeiCode } from './storage/AeiCodeComputer';
import { PineconeVectorClient } from '@sbf/vector-client';
import { AiClientFactory, LlmProvider } from '@sbf/ai-client';
import { KnowledgeGraph } from '@sbf/core-knowledge-graph';
import { ENTITY_TYPES, RELATION_TYPES } from '@sbf/types';
import * as path from 'path';
import { PluginManager } from './PluginManager';
import { SBFPlugin } from '@sbf/types';
import { logger } from '@sbf/logging';

export interface ExtractedEntity {
  name: string;
  type: string;
  description?: string;
}

export interface ExtractedRelation {
  source: string;
  target: string;
  type: string;
  description?: string;
}

export interface ExtractionResult {
  entities: ExtractedEntity[];
  relations: ExtractedRelation[];
}

export class MemoryEngine extends EventEmitter {
  private vaultAdapter: VaultAdapter;
  private lifecycleEngine: LifecycleEngine;
  private pluginManager: PluginManager;
  private hooks: MemoryEngineHooks;
  private entityCache: Map<string, Entity>;
  private vectorClient?: PineconeVectorClient;
  private aiClient?: LlmProvider;
  private knowledgeGraph?: KnowledgeGraph;

  constructor(options: VaultOptions) {
    super();
    this.hooks = options.hooks || {};
    this.entityCache = new Map();
    
    this.pluginManager = new PluginManager(logger, {
      events: this,
      config: options
    });

    this.vaultAdapter = new VaultAdapter(options.vaultRoot);
    this.lifecycleEngine = new LifecycleEngine({
      enableAutoTransitions: options.autoComputeAeiCode ?? true
    });
    this.hooks = {};
    this.entityCache = new Map();

    // Initialize Vector Client if config provided
    if (options.vector) {
      this.vectorClient = new PineconeVectorClient(
        options.vector.apiKey,
        options.vector.indexName
      );
    }

    // Initialize AI Client if config provided
    if (options.ai) {
      this.aiClient = AiClientFactory.create({
        provider: options.ai.provider,
        apiKey: options.ai.apiKey,
        baseUrl: options.ai.baseUrl
      });
    }

    // Initialize Knowledge Graph
    // TODO: Use ArangoDBAdapter if graphDbUrl is provided
    this.knowledgeGraph = new KnowledgeGraph();

    // Forward lifecycle events
    this.lifecycleEngine.on('lifecycle:transition', async (data) => {
      this.emit('lifecycle:transition', data);
      this.emitEntityEvent('lifecycle:transition', data.entity.id, data);

      // Handle physical move for archiving
      if (data.to === 'archived') {
        await this.archiveEntityFile(data.entity);
      }
    });

    this.lifecycleEngine.on('lifecycle:tick', async () => {
      await this.runAutomaticTransitions();
    });
  }

  public getGraph(): KnowledgeGraph | undefined {
    return this.knowledgeGraph;
  }

  /**
   * Ingests a file from the vault, processing it through the full pipeline:
   * 1. Parse & Validate
   * 2. Compute AEI Code
   * 3. Generate Embeddings (if AI enabled)
   * 4. Extract Entities (if AI enabled)
   * 5. Update Graph
   */
  async ingestFile(filePath: string, content: string, tenantId: string = 'default'): Promise<void> {
    try {
      // 1. Parse Entity (using VaultAdapter logic or similar)
      // For now, we assume content is raw markdown. 
      // In a real implementation, we'd use gray-matter here or delegate to VaultAdapter.
      // Since VaultAdapter reads from disk, we might need a 'parse' method exposed.
      // For this refactor, we'll rely on the fact that VaultService passes us the content.
      
      // TODO: Proper parsing. For now, mock an entity structure or use a helper.
      // We'll assume the file exists on disk and read it properly to get the Entity object.
      const entity = await this.vaultAdapter.readEntity(filePath);
      if (!entity) {
        console.warn(`Failed to read entity from ${filePath}`);
        return;
      }

      // 2. Compute AEI Code
      entity.aei_code = computeAeiCode(
        entity.memory.memory_level,
        entity.sensitivity,
        entity.control
      );

      // 3. Generate Embeddings
      if (this.vectorClient && this.aiClient) {
        const embeddingResponse = await this.aiClient.embed({ input: entity.content });
        const embedding = embeddingResponse.embeddings[0];
        
        await this.vectorClient.upsert(tenantId, [{
          id: entity.id,
          values: embedding,
          metadata: {
            text: entity.content,
            path: filePath,
            title: entity.title,
            tenantId: tenantId,
            entityId: entity.id,
            entityType: 'note', // Default type
            createdAt: entity.memory.created_at,
            ...entity.memory
          }
        }]);
      }

      // 4. Entity Extraction (for Daily Notes or if explicitly requested)
      // We check if it's a daily note based on path convention or metadata
      const isDailyNote = filePath.includes('Daily') || /^\d{4}-\d{2}-\d{2}/.test(filePath.split('/').pop() || '');
      
      if (isDailyNote && this.aiClient) {
          const extractionResult = await this.extractEntities(entity.content);
          
          // 5. Update Graph with Extracted Relations
          if (this.knowledgeGraph) {
              for (const relation of extractionResult.relations) {
                  try {
                      await this.knowledgeGraph.addRelationship({
                          source_uid: entity.id,
                          target_uid: relation.target, // Using name as ID for now
                          type: relation.type as any,
                          created: new Date().toISOString(),
                          metadata: {
                              notes: relation.description,
                          }
                      });
                  } catch (err) {
                      console.warn(`Failed to add relationship: ${relation.source} -> ${relation.target}`, err);
                  }
              }
          }
      }

      // 6. Update Graph with Explicit Relations (from frontmatter)
      if (this.knowledgeGraph && entity.relationships) {
          for (const rel of entity.relationships) {
              await this.knowledgeGraph.addRelationship({
                  source_uid: entity.id,
                  target_uid: rel.target_id,
                  type: rel.type as any,
                  created: new Date().toISOString(),
                  metadata: rel.metadata
              }); 
          }
      }

      this.entityCache.set(entity.id, entity);
      this.emit('entity:updated', entity);

    } catch (error) {
      console.error(`Error ingesting file ${filePath}:`, error);
      throw error;
    }
  }

  private async extractEntities(content: string): Promise<ExtractionResult> {
      if (!this.aiClient) return { entities: [], relations: [] };

      const prompt = `
You are an expert Knowledge Graph Engineer. Your task is to extract structured entities and relationships from the following text.

Target Ontology:
Entity Types: ${ENTITY_TYPES.join(', ')}
Relation Types: ${RELATION_TYPES.join(', ')}

Instructions:
1. Identify key entities mentioned in the text that match the allowed Entity Types.
2. Identify relationships between these entities that match the allowed Relation Types.
3. Output strictly valid JSON in the following format:
{
  "entities": [
    { "name": "Entity Name", "type": "entity_type", "description": "Brief context" }
  ],
  "relations": [
    { "source": "Entity Name A", "target": "Entity Name B", "type": "relation_type", "description": "Why this relation exists" }
  ]
}

Text to Analyze:
---
${content}
---
`;

      try {
          const response = await this.aiClient.generate({
              model: 'gpt-4-turbo-preview',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0,
          });

          const jsonStr = response.content.replace(/```json\n?|\n?```/g, '').trim();
          return JSON.parse(jsonStr) as ExtractionResult;
      } catch (error) {
          console.error('Failed to extract entities', error);
          return { entities: [], relations: [] };
      }
  }

  /**
   * Scans the vault and loads all entities
   */
  async scan(): Promise<VaultScanResult> {
    const result = await this.vaultAdapter.scan();

    // Cache entities
    for (const entity of result.entities) {
      this.entityCache.set(entity.id, entity);
    }

    return result;
  }

  /**
   * Gets an entity by ID
   */
  async getEntity(id: string): Promise<Entity | null> {
    // Check cache first
    if (this.entityCache.has(id)) {
      return this.entityCache.get(id)!;
    }

    // Try to load from vault
    const entity = await this.vaultAdapter.readEntity(id + '.md');
    if (entity) {
      this.entityCache.set(id, entity);
    }

    return entity;
  }

  /**
   * Creates a new entity
   */
  async createEntity(partial: Partial<Entity>): Promise<OperationResult<Entity>> {
    try {
      // Run before hook
      let entityData = partial;
      if (this.hooks.beforeEntityCreate) {
        entityData = await this.hooks.beforeEntityCreate(partial);
      }

      // Validate required fields
      if (!entityData.title) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Entity title is required'
          }
        };
      }

      // Generate ID if not provided
      const id = entityData.id || entityData.uid || this.generateId(entityData.title);

      // Set defaults
      const now = new Date().toISOString();
      const entity: Entity = {
        id,
        uid: id,
        vault_path: entityData.vault_path || `${id}.md`,
        title: entityData.title,
        content: entityData.content || '',
        tags: entityData.tags || [],
        memory: {
          memory_level: entityData.memory?.memory_level || 'transitory',
          stability_score: entityData.memory?.stability_score ?? 0.5,
          importance_score: entityData.memory?.importance_score ?? 0.5,
          last_active_at: now,
          user_pinned: entityData.memory?.user_pinned ?? false,
          created_at: now,
          updated_at: now
        },
        sensitivity: entityData.sensitivity || {
          level: 1,
          privacy: {
            cloud_ai_allowed: true,
            local_ai_allowed: true,
            export_allowed: true
          },
          visibility: 'public'
        },
        control: entityData.control,
        aei_code: '' // Will be computed below
      };

      // Compute AEI code
      entity.aei_code = computeAeiCode(
        entity.memory.memory_level,
        entity.sensitivity,
        entity.control
      );

      // Write to vault
      await this.vaultAdapter.writeEntity(entity);

      // Cache entity
      this.entityCache.set(id, entity);

      // Run after hook
      if (this.hooks.afterEntityCreate) {
        await this.hooks.afterEntityCreate(entity);
      }

      // Emit event
      this.emitEntityEvent('entity:created', id, entity);

      return {
        success: true,
        data: entity
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Updates an entity
   */
  async updateEntity(id: string, updates: Partial<Entity>): Promise<OperationResult<Entity>> {
    try {
      // Get existing entity
      const existing = await this.getEntity(id);
      if (!existing) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Entity with ID ${id} not found`
          }
        };
      }

      // Run before hook
      let updateData = updates;
      if (this.hooks.beforeEntityUpdate) {
        updateData = await this.hooks.beforeEntityUpdate(id, updates);
      }

      // Merge updates
      const updated: Entity = {
        ...existing,
        ...updateData,
        id: existing.id, // Don't allow ID change
        uid: existing.uid,
        memory: {
          ...existing.memory,
          ...updateData.memory,
          updated_at: new Date().toISOString()
        }
      };

      // Recompute AEI code if memory or sensitivity changed
      if (updateData.memory?.memory_level || updateData.sensitivity || updateData.control) {
        updated.aei_code = computeAeiCode(
          updated.memory.memory_level,
          updated.sensitivity,
          updated.control
        );
      }

      // Write to vault
      await this.vaultAdapter.writeEntity(updated);

      // Update cache
      this.entityCache.set(id, updated);

      // Run after hook
      if (this.hooks.afterEntityUpdate) {
        await this.hooks.afterEntityUpdate(updated);
      }

      // Emit event
      this.emitEntityEvent('entity:updated', id, updated);

      return {
        success: true,
        data: updated
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Deletes an entity
   */
  async deleteEntity(id: string): Promise<OperationResult<boolean>> {
    try {
      // Check if entity exists
      const existing = await this.getEntity(id);
      if (!existing) {
        return {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Entity with ID ${id} not found`
          }
        };
      }

      // Run before hook (can cancel deletion)
      if (this.hooks.beforeEntityDelete) {
        const shouldDelete = await this.hooks.beforeEntityDelete(id);
        if (!shouldDelete) {
          return {
            success: false,
            error: {
              code: 'CANCELLED',
              message: 'Deletion cancelled by hook'
            }
          };
        }
      }

      // Delete from vault
      const deleted = await this.vaultAdapter.deleteEntity(existing.vault_path);

      if (!deleted) {
        return {
          success: false,
          error: {
            code: 'DELETE_ERROR',
            message: 'Failed to delete entity from vault'
          }
        };
      }

      // Remove from cache
      this.entityCache.delete(id);

      // Run after hook
      if (this.hooks.afterEntityDelete) {
        await this.hooks.afterEntityDelete(id);
      }

      // Emit event
      this.emitEntityEvent('entity:deleted', id);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error instanceof Error ? error.message : String(error),
          details: error
        }
      };
    }
  }

  /**
   * Deletes a file from the system (Cache, Vector, Graph)
   */
  async deleteFile(filePath: string, tenantId: string = 'default'): Promise<void> {
    // Find entity by path
    // Note: This is inefficient if we don't have a path->id map. 
    // For now, iterate cache.
    let entityId: string | undefined;
    
    // Normalize input path
    const normalizedInput = path.resolve(filePath).toLowerCase();

    for (const [id, entity] of this.entityCache.entries()) {
        // Normalize entity path
        // entity.vault_path is relative or absolute depending on how it was created.
        // VaultAdapter.readEntity returns absolute path if we passed absolute path?
        // Let's check VaultAdapter.readEntity implementation.
        // It calls processMarkdownFile which sets vault_path to relative path.
        
        // So we need to resolve entity.vault_path against vaultRoot to get absolute path
        const entityFullPath = path.resolve(this.vaultAdapter.vaultRoot, entity.vault_path).toLowerCase();
        
        if (entityFullPath === normalizedInput) {
            entityId = id;
            break;
        }
    }

    if (!entityId) {
        console.warn(`[MemoryEngine] Delete requested for unknown file: ${filePath} (Normalized: ${normalizedInput})`);
        // Debug: print cache keys/paths
        // console.log('Cache keys:', Array.from(this.entityCache.keys()));
        return;
    }

    // 1. Remove from Cache
    this.entityCache.delete(entityId);

    // 2. Remove from Vector Store
    if (this.vectorClient) {
        await this.vectorClient.delete(tenantId, [entityId]);
    }

    // 3. Remove from Graph (Nodes & Edges)
    // TODO: Implement deleteNode in KnowledgeGraph
    // if (this.knowledgeGraph) {
    //    await this.knowledgeGraph.deleteNode(entityId);
    // }

    this.emit('entity:deleted', { id: entityId, path: filePath });
  }

  /**
   * Transitions an entity to a new lifecycle state
   */
  async transitionEntity(
    id: string,
    targetState: LifecycleState,
    automatic: boolean = false,
    reason?: string
  ): Promise<OperationResult<Entity>> {
    const entity = await this.getEntity(id);
    if (!entity) {
      return {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Entity with ID ${id} not found`
        }
      };
    }

    const transitioned = this.lifecycleEngine.transition(entity, targetState, automatic, reason);

    // Save updated entity
    return this.updateEntity(id, transitioned);
  }

  /**
   * Runs automatic lifecycle transitions on all cached entities
   */
  async runAutomaticTransitions(): Promise<void> {
    // Ensure we have the latest state from the vault
    // In a real scenario, we might not want to scan everything every time
    // But for now, let's rely on the cache being populated by the watcher
    const entities = Array.from(this.entityCache.values());
    
    // Also scan for any entities that might have been missed if cache is empty
    if (entities.length === 0) {
        const scanResult = await this.scan();
        entities.push(...scanResult.entities);
    }

    const updated = await this.lifecycleEngine.applyAutomaticTransitions(entities);

    // Save updated entities
    for (const entity of updated) {
      // Check if the entity was actually modified by the lifecycle engine
      // The applyAutomaticTransitions returns the modified entities
      
      // We need to persist the change to disk
      // This might involve moving the file if the folder structure reflects memory levels
      // e.g. 01_Transitory -> 08_Archive
      
      // For now, we just update the metadata in the file
      await this.updateEntity(entity.id, entity);
      
      // Note: File movement is handled by the 'lifecycle:transition' event listener
    }
  }

  private async archiveEntityFile(entity: Entity): Promise<void> {
      // Logic to move file to Archive folder
      // We assume a standard folder structure where '08_Archive' exists at the root
      // and we preserve the subdirectory structure or flatten it.
      // For simplicity, let's move to '08_Archive/Daily' if it's a daily note, or '08_Archive/General' otherwise.
      
      const fileName = path.basename(entity.vault_path);
      let targetSubDir = 'General';
      
      if (entity.vault_path.includes('Daily') || /^\d{4}-\d{2}-\d{2}/.test(fileName)) {
          targetSubDir = 'Daily';
      }
      
      const newPath = path.join('08_Archive', targetSubDir, fileName).replace(/\\/g, '/');
      
      console.log(`[Lifecycle] Archiving entity file: ${entity.title} (${entity.id}) to ${newPath}`);
      
      const success = await this.vaultAdapter.moveEntity(entity.vault_path, newPath);
      if (success) {
          // Update entity path in memory
          entity.vault_path = newPath;
          this.entityCache.set(entity.id, entity);
          
          // Update vector index with new path
          if (this.vectorClient) {
              // We need to re-upsert with new metadata
              // Ideally we should have a 'updateMetadata' method, but upsert works
              // Note: We might need to delete the old ID if the ID was path-based, 
              // but here ID is UUID-based (mostly), so upsert updates the record.
              // If ID is path-based, we have a problem. 
              // In VaultService, we used relativePath as ID. 
              // In MemoryEngine, we use frontmatter.uid or generateIdFromPath.
              // If generateIdFromPath uses the path, the ID changes!
              // Let's assume for now ID is stable (UID).
              
              // TODO: Handle ID change if ID is path-dependent
          }
      }
  }

  /**
   * Registers hooks
   */
  registerHooks(hooks: Partial<MemoryEngineHooks>): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Gets the lifecycle engine
   */
  get lifecycle(): LifecycleEngine {
    return this.lifecycleEngine;
  }

  /**
   * Emits an entity event
   */
  private emitEntityEvent(type: EntityEvent['type'], entityId: string, data?: unknown): void {
    const event: EntityEvent = {
      type,
      entityId,
      timestamp: new Date().toISOString(),
      data
    };
    this.emit(type, event);
    this.emit('entity:*', event);
  }

  /**
   * Generates a unique ID from title
   */
  private generateId(title: string): string {
    const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Cleanup
   */
  async shutdown(): Promise<void> {
    this.lifecycleEngine.stop();
    this.entityCache.clear();
    this.removeAllListeners();
  }

  public async registerPlugin(plugin: SBFPlugin) {
    await this.pluginManager.registerPlugin(plugin);
  }

  public getPluginTools(): any[] {
    return this.pluginManager.getAllTools();
  }
}
