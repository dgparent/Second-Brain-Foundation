/**
 * Lifecycle Automation Service
 * Orchestrates the complete 48-hour lifecycle automation
 */

import { EventEmitter } from 'eventemitter3';
import { EntityManager } from '@sbf/core-entity-manager';
import { BaseAIProvider } from '@sbf/aei';
import { LifecycleEngine } from './index';
import { Scheduler } from './scheduler';
import { EntityExtractionWorkflow } from './extraction';
import { DissolutionWorkflow, DissolutionResult } from './dissolution';

export interface LifecycleAutomationConfig {
  entityManager: EntityManager;
  aiProvider: BaseAIProvider;
  checkIntervalMinutes?: number;
  enableAutoDissolution?: boolean;
}

export interface LifecycleAutomationEvents {
  'automation:started': () => void;
  'automation:stopped': () => void;
  'automation:check': (timestamp: Date) => void;
  'automation:dissolution:batch': (results: DissolutionResult[]) => void;
}

export class LifecycleAutomationService extends EventEmitter<LifecycleAutomationEvents> {
  private lifecycleEngine: LifecycleEngine;
  private scheduler: Scheduler;
  private extractionWorkflow: EntityExtractionWorkflow;
  private dissolutionWorkflow: DissolutionWorkflow;
  private config: Required<LifecycleAutomationConfig>;
  private isRunning: boolean = false;

  constructor(config: LifecycleAutomationConfig) {
    super();
    this.config = {
      ...config,
      checkIntervalMinutes: config.checkIntervalMinutes ?? 60,
      enableAutoDissolution: config.enableAutoDissolution ?? true,
    };

    // Initialize components
    this.lifecycleEngine = new LifecycleEngine(config.entityManager);
    this.scheduler = new Scheduler({
      persistJobs: true,
      checkIntervalMs: this.config.checkIntervalMinutes * 60 * 1000,
    });

    this.extractionWorkflow = new EntityExtractionWorkflow({
      provider: config.aiProvider,
      entityManager: config.entityManager,
      confidenceThreshold: 0.75,
    });

    this.dissolutionWorkflow = new DissolutionWorkflow({
      entityManager: config.entityManager,
      extractionWorkflow: this.extractionWorkflow,
      archiveEnabled: true,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for all components
   */
  private setupEventHandlers(): void {
    // Lifecycle engine events
    this.lifecycleEngine.on('lifecycle:auto-transition', (entity, from, to) => {
      console.log(`Auto-transitioned ${entity.uid} from ${from} to ${to}`);
    });

    // Extraction workflow events
    this.extractionWorkflow.on('extraction:completed', (result) => {
      console.log(`Extracted ${result.extractedEntities.length} entities from ${result.entityUid}`);
    });

    // Dissolution workflow events
    this.dissolutionWorkflow.on('dissolution:completed', (result) => {
      console.log(`Dissolved ${result.dailyNoteUid}: ${result.summary}`);
    });

    this.dissolutionWorkflow.on('dissolution:prevented', (uid, reason) => {
      console.log(`Dissolution prevented for ${uid}: ${reason}`);
    });
  }

  /**
   * Initialize the automation service
   */
  async initialize(): Promise<void> {
    await this.scheduler.initialize();
    await this.scheduleAutomationJobs();
  }

  /**
   * Schedule automation jobs
   */
  private async scheduleAutomationJobs(): Promise<void> {
    // Schedule daily note review job
    await this.scheduler.scheduleJob({
      name: 'daily-note-review',
      description: 'Review daily notes for 48-hour dissolution',
      frequency: 'hourly',
      cronExpression: '0 * * * *', // Every hour
      nextRunTime: new Date(Date.now() + 60 * 60 * 1000), // Start in 1 hour
      maxRetries: 3,
      enabled: this.config.enableAutoDissolution,
      handler: async () => {
        await this.performDailyNoteReview();
      },
    });

    // Schedule lifecycle state transitions
    await this.scheduler.scheduleJob({
      name: 'lifecycle-transitions',
      description: 'Check for automatic lifecycle state transitions',
      frequency: 'hourly',
      cronExpression: '30 * * * *', // Every hour at 30 minutes past
      nextRunTime: new Date(Date.now() + 30 * 60 * 1000), // Start in 30 minutes
      maxRetries: 3,
      enabled: true,
      handler: async () => {
        // This is already handled by lifecycleEngine.start()
        // but we can add additional checks here
      },
    });
  }

  /**
   * Perform daily note review and dissolution
   */
  private async performDailyNoteReview(): Promise<void> {
    this.emit('automation:check', new Date());

    try {
      // Get all daily notes that are due for dissolution
      const dailyNotes = await this.getDailyNotesDueForDissolution();

      if (dailyNotes.length === 0) {
        console.log('No daily notes due for dissolution');
        return;
      }

      console.log(`Found ${dailyNotes.length} daily notes due for dissolution`);

      // Dissolve daily notes
      const results = await this.dissolutionWorkflow.dissolveMultiple(
        dailyNotes.map(note => note.uid)
      );

      this.emit('automation:dissolution:batch', results);
    } catch (error) {
      console.error('Failed to perform daily note review:', error);
    }
  }

  /**
   * Get daily notes that are due for dissolution (older than 48 hours)
   */
  private async getDailyNotesDueForDissolution() {
    const allEntities = await this.config.entityManager.getAll();
    const now = Date.now();
    const hoursSinceThreshold = 48;

    return allEntities.filter(entity => {
      if (entity.type !== 'daily-note') return false;
      if (entity.lifecycle?.state === 'archived') return false;
      if (entity.metadata?.prevent_dissolve) return false;

      const created = new Date(entity.created).getTime();
      const hoursSinceCreated = (now - created) / (1000 * 60 * 60);

      return hoursSinceCreated >= hoursSinceThreshold;
    });
  }

  /**
   * Start the automation service
   */
  start(): void {
    if (this.isRunning) {
      console.log('Automation service is already running');
      return;
    }

    this.lifecycleEngine.start(this.config.checkIntervalMinutes);
    this.scheduler.start();
    this.isRunning = true;

    this.emit('automation:started');
    console.log('Lifecycle automation service started');
  }

  /**
   * Stop the automation service
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Automation service is not running');
      return;
    }

    this.lifecycleEngine.stop();
    this.scheduler.stop();
    this.isRunning = false;

    this.emit('automation:stopped');
    console.log('Lifecycle automation service stopped');
  }

  /**
   * Manually trigger dissolution for specific daily notes
   */
  async manuallyDissolve(dailyNoteUids: string[]): Promise<DissolutionResult[]> {
    return this.dissolutionWorkflow.dissolveMultiple(dailyNoteUids);
  }

  /**
   * Prevent dissolution for specific daily note
   */
  async preventDissolution(dailyNoteUid: string, reason?: string): Promise<boolean> {
    const updated = await this.config.entityManager.update(dailyNoteUid, {
      metadata: {
        prevent_dissolve: true,
        prevent_dissolve_reason: reason || 'User request',
        prevent_dissolve_date: new Date().toISOString(),
      },
    });

    return !!updated;
  }

  /**
   * Postpone dissolution by extending the 48-hour window
   */
  async postponeDissolution(dailyNoteUid: string, hoursToPostpone: number = 48): Promise<boolean> {
    const entity = await this.config.entityManager.get(dailyNoteUid);
    if (!entity) return false;

    const postponeUntil = new Date(Date.now() + hoursToPostpone * 60 * 60 * 1000);

    const updated = await this.config.entityManager.update(dailyNoteUid, {
      metadata: {
        ...entity.metadata,
        postpone_until: postponeUntil.toISOString(),
        postponed_date: new Date().toISOString(),
        postponed_hours: hoursToPostpone,
      },
    });

    return !!updated;
  }

  /**
   * Check if automation is running
   */
  isAutomationRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Find notes ready for dissolution
   */
  async findNotesReadyForDissolution() {
    return this.getDailyNotesDueForDissolution();
  }

  /**
   * Allow dissolution (remove prevent flag)
   */
  async allowDissolution(dailyNoteUid: string): Promise<boolean> {
    const entity = await this.config.entityManager.get(dailyNoteUid);
    if (!entity) return false;

    const updated = await this.config.entityManager.update(dailyNoteUid, {
      metadata: {
        ...entity.metadata,
        prevent_dissolve: false,
      },
    });

    return !!updated;
  }

  /**
   * Get automation statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      checkIntervalMinutes: this.config.checkIntervalMinutes,
      enableAutoDissolution: this.config.enableAutoDissolution,
      lifecycle: this.lifecycleEngine.getStats(),
      scheduler: this.scheduler.getStats(),
    };
  }

  /**
   * Get automation statistics (alias for getStats)
   */
  getStatistics() {
    const stats = this.getStats();
    return {
      automationEnabled: this.config.enableAutoDissolution,
      totalDissolutions: 0, // TODO: Track this
      pendingReviews: 0, // TODO: Track this
      preventedDissolutions: 0, // TODO: Track this
      ...stats,
    };
  }
}
