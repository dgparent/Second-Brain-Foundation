/**
 * Integration Service
 * 
 * Orchestrates all components:
 * - SBFAgent (chat, tool execution)
 * - WatcherService (file monitoring, queue)
 * - EntityFileManager (entity CRUD)
 * 
 * This is the main service that connects UI to backend functionality.
 */

import { EventEmitter } from 'events';
import { SBFAgent, SBFAgentConfig } from '../agent/sbf-agent';
import { WatcherService, WatcherServiceConfig } from '../watcher/watcher-service';
import { EntityFileManager } from '../entities/entity-file-manager';
import { Vault } from '../filesystem/vault';
import { QueueItem } from '../watcher/organization-queue';
import { MessageCreate, AgentResponse } from '../agent/base-agent';

/**
 * Integration service configuration
 */
export interface IntegrationServiceConfig {
  vaultPath: string;
  agentConfig: Omit<SBFAgentConfig, 'vaultPath'>;
  watcherConfig?: Partial<WatcherServiceConfig>;
  autoStartWatcher?: boolean;
}

/**
 * Integration service events
 */
export interface IntegrationServiceEvents {
  'started': () => void;
  'stopped': () => void;
  'queue-updated': (items: QueueItem[]) => void;
  'entity-created': (uid: string, path: string) => void;
  'error': (error: Error) => void;
}

/**
 * Integration Service
 * 
 * Main service that connects all components
 */
export class IntegrationService extends EventEmitter {
  private agent: SBFAgent | null = null;
  private watcher: WatcherService | null = null;
  private entityManager: EntityFileManager;
  private vault: Vault;
  private config: IntegrationServiceConfig;
  private isRunning: boolean = false;

  constructor(config: IntegrationServiceConfig) {
    super();
    this.config = config;
    
    // Initialize vault and entity manager
    this.vault = new Vault(config.vaultPath);
    this.entityManager = new EntityFileManager(config.vaultPath);
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isRunning) {
      console.warn('Integration service already running');
      return;
    }

    console.log('Initializing integration service...');

    try {
      // Initialize agent
      this.agent = await SBFAgent.create({
        ...this.config.agentConfig,
        vaultPath: this.config.vaultPath,
      });

      // Initialize watcher if enabled
      if (this.config.autoStartWatcher !== false) {
        this.watcher = new WatcherService({
          vaultPath: this.config.vaultPath,
          vault: this.vault,
          ...this.config.watcherConfig,
        });

        // Wire up watcher events
        this.watcher.on('queue-item-added', (item: QueueItem) => {
          this.emit('queue-updated', this.getQueueItems());
        });

        this.watcher.on('processing-needed', async (item: QueueItem) => {
          await this.handleQueueItem(item);
        });

        this.watcher.on('error', (error: Error) => {
          console.error('Watcher error:', error);
          this.emit('error', error);
        });

        // Start watcher
        await this.watcher.start();
      }

      this.isRunning = true;
      this.emit('started');

      console.log('Integration service initialized');
    } catch (error) {
      console.error('Failed to initialize integration service:', error);
      throw error;
    }
  }

  /**
   * Handle queue item processing
   * 
   * Called when a queue item is approved and ready for processing
   */
  private async handleQueueItem(item: QueueItem): Promise<void> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    try {
      console.log(Processing queue item: );

      // Determine action from processing result
      const action = item.processingResult?.action;

      if (action === 'extract_entities') {
        // Extract entities from file
        await this.extractEntitiesFromFile(item.event.path);
      } else if (action === 'update_metadata') {
        // Update file metadata
        // TODO: Implement
        console.log('Update metadata not yet implemented');
      }

      console.log(Queue item processed: );
    } catch (error) {
      console.error(Error processing queue item :, error);
      this.emit('error', error as Error);
    }
  }

  /**
   * Extract entities from a file using the agent
   */
  private async extractEntitiesFromFile(filePath: string): Promise<void> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    try {
      // Read file content
      const fileContent = await this.vault.readFile(filePath);
      
      // Use agent to extract entities
      const prompt = Extract entities from this file and create them in the vault:

File: 
Content:


Extract the following types of entities:
- Topics (concepts, subjects, ideas mentioned)
- Projects (tasks, goals, initiatives mentioned)
- People (names of people mentioned)
- Places (locations mentioned)

For each entity:
1. Use the create_entity tool to create it
2. Use create_relationship to link it to the source file ""

Be thorough but only extract entities that are clearly mentioned.;

      // Execute with agent
      const response = await this.agent.step([{
        role: 'user',
        content: prompt,
      }]);

      console.log('Entity extraction response:', response);
      
      // Emit entity created events
      // (Tools will handle actual creation)
      this.emit('queue-updated', this.getQueueItems());
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw error;
    }
  }

  /**
   * Send a message to the agent
   */
  async sendMessage(message: string): Promise<AgentResponse> {
    if (!this.agent) {
      throw new Error('Agent not initialized');
    }

    const messages: MessageCreate[] = [{
      role: 'user',
      content: message,
    }];

    return await this.agent.step(messages);
  }

  /**
   * Get current queue items
   */
  getQueueItems(): QueueItem[] {
    if (!this.watcher) {
      return [];
    }

    return this.watcher.getQueue().getItems();
  }

  /**
   * Approve a queue item
   */
  approveQueueItem(itemId: string): void {
    if (!this.watcher) {
      throw new Error('Watcher not initialized');
    }

    this.watcher.getQueue().approveItem(itemId);
    this.emit('queue-updated', this.getQueueItems());
  }

  /**
   * Reject a queue item
   */
  rejectQueueItem(itemId: string): void {
    if (!this.watcher) {
      throw new Error('Watcher not initialized');
    }

    this.watcher.getQueue().rejectItem(itemId);
    this.emit('queue-updated', this.getQueueItems());
  }

  /**
   * List all entities in the vault
   */
  async listEntities(): Promise<any[]> {
    return await this.entityManager.list();
  }

  /**
   * Get a single entity by UID
   */
  async getEntity(uid: string): Promise<any> {
    return await this.entityManager.read(uid);
  }

  /**
   * Update an entity
   */
  async updateEntity(uid: string, updates: any): Promise<void> {
    await this.entityManager.update(uid, updates);
  }

  /**
   * Delete an entity
   */
  async deleteEntity(uid: string): Promise<void> {
    await this.entityManager.delete(uid);
  }

  /**
   * Search entities
   */
  async searchEntities(query: string): Promise<any[]> {
    const allEntities = await this.listEntities();
    const lowerQuery = query.toLowerCase();

    return allEntities.filter(entity => {
      return (
        entity.title?.toLowerCase().includes(lowerQuery) ||
        entity.content?.toLowerCase().includes(lowerQuery) ||
        entity.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery)) ||
        entity.aliases?.some((alias: string) => alias.toLowerCase().includes(lowerQuery))
      );
    });
  }

  /**
   * Get agent state
   */
  getAgentState(): any {
    if (!this.agent) {
      return null;
    }

    return {
      userId: this.agent.getState().userId,
      name: this.agent.getState().name,
      memory: this.agent.getMemory(),
      messageCount: this.agent.getState().conversationHistory.length,
    };
  }

  /**
   * Stop the service
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping integration service...');

    if (this.watcher) {
      await this.watcher.stop();
    }

    this.isRunning = false;
    this.emit('stopped');

    console.log('Integration service stopped');
  }
}

/**
 * Create integration service
 */
export function createIntegrationService(
  config: IntegrationServiceConfig
): IntegrationService {
  return new IntegrationService(config);
}
