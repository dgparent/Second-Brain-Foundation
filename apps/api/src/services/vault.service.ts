import { VaultWatcher, FileEvent } from '@sbf/core-vault-connector';
import { logger } from '@sbf/logging';
import { MemoryEngine } from '@sbf/memory-engine';
import { entityExtractionService } from './entity-extraction.service';
import { lifecycleService } from './lifecycle.service';
import path from 'path';
import fs from 'fs';

export class VaultService {
  private watchers: Map<string, VaultWatcher> = new Map();
  private memoryEngines: Map<string, MemoryEngine> = new Map();
  private baseVaultPath: string;

  constructor() {
    // Default to a 'vaults' directory in the root, or override with env
    this.baseVaultPath = process.env.VAULTS_BASE_PATH || path.resolve(process.cwd(), '../../vaults');
    
    // Fallback for single-tenant dev mode if VAULT_PATH is set directly
    if (process.env.VAULT_PATH) {
        this.baseVaultPath = path.dirname(process.env.VAULT_PATH);
    }
  }

  /**
   * Initializes and starts a watcher for a specific tenant
   */
  public async startTenantWatcher(tenantId: string) {
    if (this.watchers.has(tenantId)) {
        return; // Already watching
    }

    const tenantVaultPath = this.getTenantPath(tenantId);
    
    if (!fs.existsSync(tenantVaultPath)) {
      logger.warn(`Vault path does not exist for tenant ${tenantId}: ${tenantVaultPath}. Skipping.`);
      return;
    }

    logger.info(`Starting Vault Watcher for tenant: ${tenantId} at ${tenantVaultPath}`);
    
    // Initialize Memory Engine for this tenant
    const memoryEngine = new MemoryEngine({
        vaultRoot: tenantVaultPath,
        autoComputeAeiCode: true,
        vector: {
            apiKey: process.env.PINECONE_API_KEY || 'dummy-key',
            indexName: process.env.PINECONE_INDEX || 'sbf-index'
        },
        ai: {
            provider: 'openai',
            apiKey: process.env.OPENAI_API_KEY || 'dummy-key'
        }
    });
    this.memoryEngines.set(tenantId, memoryEngine);

    const watcher = new VaultWatcher(tenantVaultPath);
    
    watcher.events$.subscribe((event: FileEvent) => {
      this.handleEvent(tenantId, event);
    });

    await watcher.start();
    this.watchers.set(tenantId, watcher);

    // Run lifecycle maintenance in background
    this.runLifecycle(tenantId).catch(err => {
        logger.error(`Lifecycle maintenance failed for tenant ${tenantId}`, err);
    });
  }

  /**
   * Runs lifecycle maintenance tasks for a tenant
   */
  public async runLifecycle(tenantId: string) {
      const tenantVaultPath = this.getTenantPath(tenantId);
      if (fs.existsSync(tenantVaultPath)) {
          logger.info(`Running lifecycle maintenance for tenant: ${tenantId}`);
          await lifecycleService.processDailyNotes(tenantVaultPath);
      }
  }

  /**
   * Gets the MemoryEngine instance for a tenant
   */
  public getMemoryEngine(tenantId: string): MemoryEngine | undefined {
    return this.memoryEngines.get(tenantId);
  }

  /**
   * Stops a watcher for a specific tenant
   */
  public async stopTenantWatcher(tenantId: string) {
    const watcher = this.watchers.get(tenantId);
    if (watcher) {
        await watcher.stop();
        this.watchers.delete(tenantId);
        this.memoryEngines.delete(tenantId);
        logger.info(`Stopped Vault Watcher for tenant: ${tenantId}`);
    }
  }

  /**
   * Stops all watchers
   */
  public async stopAll() {
    logger.info('Stopping all Vault Watchers...');
    for (const [tenantId, watcher] of this.watchers) {
        await watcher.stop();
        logger.info(`Stopped watcher for ${tenantId}`);
    }
    this.watchers.clear();
    this.memoryEngines.clear();
  }

  private getTenantPath(tenantId: string): string {
      // If VAULT_PATH is explicitly set (Dev Single Tenant Mode), use it for the "default" tenant
      if (process.env.VAULT_PATH && tenantId === 'default') {
          return process.env.VAULT_PATH;
      }
      return path.join(this.baseVaultPath, tenantId);
  }

  private async handleEvent(tenantId: string, event: FileEvent) {
    logger.info({
      msg: 'Vault file event received',
      tenantId,
      type: event.type,
      path: event.path,
      hasParsedContent: !!event.parsed
    });

    const memoryEngine = this.memoryEngines.get(tenantId);
    if (!memoryEngine) {
        logger.error(`No Memory Engine found for tenant ${tenantId}`);
        return;
    }

    if (event.type === 'unlink') {
        // Handle deletion
        // TODO: Implement delete in MemoryEngine
        return;
    }
    
    if (event.parsed) {
        try {
            const { frontmatter, content } = event.parsed;
            const relativePath = path.relative(this.getTenantPath(tenantId), event.path);
            
            // 1. Ingest into Memory Engine (Handles Embedding & Basic Graph)
            await memoryEngine.ingestFile(event.path, content, tenantId);
            logger.info(`Ingested file into Memory Engine: ${relativePath}`);

            // 2. Entity Extraction (for Daily Notes)
            const isDailyNote = relativePath.includes('Daily') || /^\d{4}-\d{2}-\d{2}/.test(path.basename(relativePath));
            
            if (isDailyNote) {
                logger.info(`Processing Daily Note for entity extraction: ${relativePath}`);
                const extractionResult = await entityExtractionService.extract(content);
                
                logger.info({
                    msg: 'Entities extracted',
                    count: extractionResult.entities.length,
                    relations: extractionResult.relations.length,
                    entities: extractionResult.entities
                });

                // 3. Persist to Knowledge Graph via Memory Engine
                const graph = memoryEngine.getGraph();
                if (graph) {
                    const sourceEntityId = frontmatter.id || relativePath;

                    for (const relation of extractionResult.relations) {
                        try {
                            await graph.addRelationship({
                                source_uid: sourceEntityId,
                                target_uid: relation.target,
                                type: relation.type as any,
                                created: new Date().toISOString(),
                                metadata: {
                                    notes: relation.description,
                                }
                            });
                        } catch (err) {
                            logger.warn(`Failed to add relationship: ${relation.source} -> ${relation.target}`, err);
                        }
                    }
                    logger.info(`Persisted ${extractionResult.relations.length} relationships to Knowledge Graph`);
                }
            }

        } catch (error: any) {
            logger.error(`Failed to process embedding for ${event.path}`, { message: error.message, stack: error.stack });
        }
    }
  }
}

export const vaultService = new VaultService();

