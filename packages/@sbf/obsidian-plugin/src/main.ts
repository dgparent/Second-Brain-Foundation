/**
 * SBF Companion Plugin - Main Entry Point
 * 
 * Second Brain Foundation Companion Plugin for Obsidian.
 * Per PRD Epic 4 Story 4.1: Obsidian Companion Plugin
 */

import {
  Plugin,
  Notice,
  TFile,
  WorkspaceLeaf,
  Menu,
  MarkdownView,
} from 'obsidian';
import {
  SBFPluginSettings,
  DEFAULT_SETTINGS,
  SyncOptions,
  SyncResult,
} from './types';
import { SBFClient } from './api/SBFClient';
import { SyncEngine } from './sync/SyncEngine';
import { FolderScanner } from './sync/FolderScanner';
import { SettingsTab } from './ui/SettingsTab';
import { SyncStatusBar } from './ui/SyncStatusBar';
import { ConflictModal, ConflictModalResult } from './ui/ConflictModal';

export default class SBFPlugin extends Plugin {
  settings: SBFPluginSettings = DEFAULT_SETTINGS;
  client: SBFClient | null = null;
  syncEngine: SyncEngine | null = null;
  statusBar: SyncStatusBar | null = null;
  private autoSyncInterval: number | null = null;

  async onload(): Promise<void> {
    console.log('Loading SBF Companion Plugin');

    // Load settings
    await this.loadSettings();

    // Initialize API client
    this.client = new SBFClient(this.settings);

    // Initialize sync engine
    this.syncEngine = new SyncEngine(
      this.app.vault,
      this.app.metadataCache,
      this.client,
      this.settings
    );

    // Add settings tab
    this.addSettingTab(new SettingsTab(this.app, this));

    // Add status bar
    if (this.settings.showStatusBar) {
      this.statusBar = new SyncStatusBar(this);
    }

    // Register commands
    this.registerCommands();

    // Register ribbon icon
    this.addRibbonIcon('brain', 'SBF Sync', (evt: MouseEvent) => {
      const menu = new Menu();

      menu.addItem((item) =>
        item
          .setTitle('Sync Now')
          .setIcon('refresh-cw')
          .onClick(() => this.syncNow())
      );

      menu.addItem((item) =>
        item
          .setTitle('Upload Only')
          .setIcon('upload')
          .onClick(() => this.syncNow({ direction: 'up' }))
      );

      menu.addItem((item) =>
        item
          .setTitle('Download Only')
          .setIcon('download')
          .onClick(() => this.syncNow({ direction: 'down' }))
      );

      menu.addSeparator();

      menu.addItem((item) =>
        item
          .setTitle('Settings')
          .setIcon('settings')
          .onClick(() => {
            // Open settings
            const setting = (this.app as any).setting;
            setting.open();
            setting.openTabById('sbf-companion');
          })
      );

      menu.showAtMouseEvent(evt);
    });

    // Register file menu items
    this.registerEvent(
      this.app.workspace.on('file-menu', (menu, file) => {
        if (file instanceof TFile && file.extension === 'md') {
          menu.addItem((item) =>
            item
              .setTitle('Sync with SBF')
              .setIcon('cloud-upload')
              .onClick(() => this.syncFile(file))
          );
        }
      })
    );

    // Setup auto-sync
    this.setupAutoSync();

    // Update status bar on file changes
    this.registerEvent(
      this.app.vault.on('modify', () => {
        if (this.statusBar) {
          this.statusBar.setStatus('pending');
        }
      })
    );
  }

  onunload(): void {
    console.log('Unloading SBF Companion Plugin');

    // Clear auto-sync
    if (this.autoSyncInterval) {
      window.clearInterval(this.autoSyncInterval);
    }

    // Cleanup status bar
    if (this.statusBar) {
      this.statusBar.destroy();
    }
  }

  /**
   * Register plugin commands
   */
  private registerCommands(): void {
    // Sync now
    this.addCommand({
      id: 'sync-now',
      name: 'Sync Now',
      icon: 'refresh-cw',
      callback: () => this.syncNow(),
    });

    // Upload only
    this.addCommand({
      id: 'sync-upload',
      name: 'Upload to SBF',
      icon: 'upload',
      callback: () => this.syncNow({ direction: 'up' }),
    });

    // Download only
    this.addCommand({
      id: 'sync-download',
      name: 'Download from SBF',
      icon: 'download',
      callback: () => this.syncNow({ direction: 'down' }),
    });

    // Sync current file
    this.addCommand({
      id: 'sync-current-file',
      name: 'Sync Current File',
      icon: 'file-sync',
      checkCallback: (checking: boolean) => {
        const file = this.app.workspace.getActiveFile();
        if (file && file.extension === 'md') {
          if (!checking) {
            this.syncFile(file);
          }
          return true;
        }
        return false;
      },
    });

    // Create folder structure
    this.addCommand({
      id: 'create-folders',
      name: 'Create SBF Folder Structure',
      icon: 'folder-plus',
      callback: () => this.createFolderStructure(),
    });

    // Test connection
    this.addCommand({
      id: 'test-connection',
      name: 'Test API Connection',
      icon: 'activity',
      callback: async () => {
        const success = await this.testConnection();
        new Notice(success ? '✅ Connection OK' : '❌ Connection failed');
      },
    });
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  /**
   * Save settings to storage
   */
  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);

    // Update client settings
    if (this.client) {
      this.client.updateSettings(this.settings);
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    return this.client.testConnection();
  }

  /**
   * Run sync operation
   */
  async syncNow(overrides?: Partial<SyncOptions>): Promise<SyncResult | null> {
    if (!this.syncEngine || !this.client) {
      new Notice('SBF not configured');
      return null;
    }

    if (!this.settings.apiKey) {
      new Notice('Please configure your API key in settings');
      return null;
    }

    const options: SyncOptions = {
      direction: overrides?.direction || this.settings.syncDirection,
      conflictResolution: this.settings.conflictResolution,
      dryRun: overrides?.dryRun,
      force: overrides?.force,
    };

    // Update status bar
    if (this.statusBar) {
      this.statusBar.setStatus('syncing');
    }

    try {
      const result = await this.syncEngine.sync(options);

      // Handle conflicts
      if (result.conflicts.length > 0 && options.conflictResolution === 'ask') {
        await this.handleConflicts(result);
      }

      // Update status bar
      if (this.statusBar) {
        this.statusBar.setSyncComplete(result);
      }

      return result;
    } catch (error) {
      console.error('Sync error:', error);
      
      if (this.statusBar) {
        this.statusBar.setStatus('error');
      }
      
      new Notice(`Sync failed: ${(error as Error).message}`);
      return null;
    }
  }

  /**
   * Handle sync conflicts
   */
  private async handleConflicts(result: SyncResult): Promise<void> {
    return new Promise((resolve) => {
      const modal = new ConflictModal(
        this.app,
        result.conflicts,
        async (results: ConflictModalResult[]) => {
          // Process resolved conflicts
          for (const r of results) {
            if (r.resolution === 'skip') continue;

            if (r.resolution === 'local') {
              // Re-upload local version
              const file = this.app.vault.getAbstractFileByPath(r.conflict.localPath);
              if (file instanceof TFile) {
                await this.syncFile(file);
              }
            } else if (r.resolution === 'remote') {
              // Download remote version
              // This will be handled by the next sync
            } else if (r.resolution === 'merge' && r.mergedContent) {
              // Write merged content
              const file = this.app.vault.getAbstractFileByPath(r.conflict.localPath);
              if (file instanceof TFile) {
                await this.app.vault.modify(file, r.mergedContent);
                new Notice(`Merged: ${file.basename}`);
              }
            }
          }

          resolve();
        }
      );

      modal.open();
    });
  }

  /**
   * Sync single file
   */
  async syncFile(file: TFile): Promise<void> {
    if (!this.syncEngine) return;

    try {
      const content = await this.app.vault.read(file);
      const note = {
        path: file.path,
        name: file.basename,
        content,
        mtime: file.stat.mtime,
      };

      await this.syncEngine.sync({
        direction: 'up',
        conflictResolution: this.settings.conflictResolution,
        paths: [file.path],
      });

      new Notice(`Synced: ${file.basename}`);
    } catch (error) {
      console.error('File sync error:', error);
      new Notice(`Sync failed: ${(error as Error).message}`);
    }
  }

  /**
   * Create SBF folder structure
   */
  async createFolderStructure(): Promise<string[]> {
    const scanner = new FolderScanner(this.app.vault, this.settings);
    return scanner.ensureStructure();
  }

  /**
   * Update status bar visibility
   */
  updateStatusBar(): void {
    if (this.settings.showStatusBar) {
      if (!this.statusBar) {
        this.statusBar = new SyncStatusBar(this);
      }
      this.statusBar.show();
    } else if (this.statusBar) {
      this.statusBar.hide();
    }
  }

  /**
   * Setup auto-sync interval
   */
  setupAutoSync(): void {
    // Clear existing interval
    if (this.autoSyncInterval) {
      window.clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }

    // Set new interval if enabled
    if (this.settings.autoSyncInterval > 0) {
      const intervalMs = this.settings.autoSyncInterval * 60 * 1000;
      
      this.autoSyncInterval = window.setInterval(
        () => this.syncNow(),
        intervalMs
      );

      // Register for cleanup
      this.registerInterval(this.autoSyncInterval);
    }
  }
}
