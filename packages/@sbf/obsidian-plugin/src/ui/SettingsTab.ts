/**
 * SettingsTab - Plugin Settings UI
 * 
 * Settings panel for configuring the SBF Companion Plugin.
 */

import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import type SBFPlugin from '../main';
import { SBFPluginSettings, DEFAULT_SETTINGS, SensitivityLevel } from '../types';

export class SettingsTab extends PluginSettingTab {
  plugin: SBFPlugin;

  constructor(app: App, plugin: SBFPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    // Header
    containerEl.createEl('h1', { text: 'Second Brain Foundation' });
    containerEl.createEl('p', {
      text: 'Connect your Obsidian vault to SBF for AI-powered knowledge management.',
      cls: 'setting-item-description',
    });

    // Connection Section
    containerEl.createEl('h2', { text: '🔗 Connection', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('API URL')
      .setDesc('The URL of your SBF instance')
      .addText((text) =>
        text
          .setPlaceholder('https://api.secondbrainfoundation.com')
          .setValue(this.plugin.settings.apiUrl)
          .onChange(async (value) => {
            this.plugin.settings.apiUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('API Key')
      .setDesc('Your SBF API key for authentication')
      .addText((text) =>
        text
          .setPlaceholder('Enter your API key')
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Test Connection')
      .setDesc('Verify your API connection is working')
      .addButton((button) =>
        button.setButtonText('Test').onClick(async () => {
          button.setDisabled(true);
          button.setButtonText('Testing...');

          const success = await this.plugin.testConnection();

          if (success) {
            new Notice('✅ Connection successful!');
          } else {
            new Notice('❌ Connection failed. Check your URL and API key.');
          }

          button.setDisabled(false);
          button.setButtonText('Test');
        })
      );

    // Sync Section
    containerEl.createEl('h2', { text: '🔄 Sync Settings', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('Sync Direction')
      .setDesc('Default sync direction')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('bidirectional', 'Bidirectional')
          .addOption('up', 'Upload only (local → SBF)')
          .addOption('down', 'Download only (SBF → local)')
          .setValue(this.plugin.settings.syncDirection)
          .onChange(async (value) => {
            this.plugin.settings.syncDirection = value as 'bidirectional' | 'up' | 'down';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Auto-sync Interval')
      .setDesc('Sync automatically every N minutes (0 = disabled)')
      .addSlider((slider) =>
        slider
          .setLimits(0, 60, 5)
          .setValue(this.plugin.settings.autoSyncInterval)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.autoSyncInterval = value;
            await this.plugin.saveSettings();
            this.plugin.setupAutoSync();
          })
      );

    new Setting(containerEl)
      .setName('Conflict Resolution')
      .setDesc('How to handle conflicts between local and remote')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('ask', 'Ask me each time')
          .addOption('local', 'Always keep local')
          .addOption('remote', 'Always keep remote')
          .addOption('newest', 'Keep newest version')
          .setValue(this.plugin.settings.conflictResolution)
          .onChange(async (value) => {
            this.plugin.settings.conflictResolution = value as 'ask' | 'local' | 'remote' | 'newest';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Convert Wikilinks')
      .setDesc('Convert [[wikilinks]] to SBF links on upload')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.convertLinks)
          .onChange(async (value) => {
            this.plugin.settings.convertLinks = value;
            await this.plugin.saveSettings();
          })
      );

    // Privacy Section
    containerEl.createEl('h2', { text: '🔒 Privacy', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('Default Sensitivity')
      .setDesc('Default privacy level for new entities')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('public', 'Public - Any AI can process')
          .addOption('personal', 'Personal - Local AI only')
          .addOption('confidential', 'Confidential - No cloud AI')
          .addOption('secret', 'Secret - No AI processing')
          .setValue(this.plugin.settings.defaultSensitivity)
          .onChange(async (value) => {
            this.plugin.settings.defaultSensitivity = value as SensitivityLevel;
            await this.plugin.saveSettings();
          })
      );

    // Exclusions Section
    containerEl.createEl('h2', { text: '🚫 Exclusions', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('Exclude Folders')
      .setDesc('Folders to exclude from sync (comma-separated)')
      .addTextArea((text) =>
        text
          .setPlaceholder('.obsidian, .git, templates')
          .setValue(this.plugin.settings.excludeFolders.join(', '))
          .onChange(async (value) => {
            this.plugin.settings.excludeFolders = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Exclude Patterns')
      .setDesc('File patterns to exclude (comma-separated, supports *)')
      .addTextArea((text) =>
        text
          .setPlaceholder('*.excalidraw.md, *.canvas')
          .setValue(this.plugin.settings.excludePatterns.join(', '))
          .onChange(async (value) => {
            this.plugin.settings.excludePatterns = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          })
      );

    // UI Section
    containerEl.createEl('h2', { text: '🎨 Interface', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('Show Status Bar')
      .setDesc('Show sync status in the status bar')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showStatusBar)
          .onChange(async (value) => {
            this.plugin.settings.showStatusBar = value;
            await this.plugin.saveSettings();
            this.plugin.updateStatusBar();
          })
      );

    new Setting(containerEl)
      .setName('Show Notifications')
      .setDesc('Show sync progress notifications')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showNotifications)
          .onChange(async (value) => {
            this.plugin.settings.showNotifications = value;
            await this.plugin.saveSettings();
          })
      );

    // Actions Section
    containerEl.createEl('h2', { text: '⚡ Actions', cls: 'sbf-settings-header' });

    new Setting(containerEl)
      .setName('Create Folder Structure')
      .setDesc('Create SBF folder structure (Daily, People, Places, Topics, Projects, Transitional)')
      .addButton((button) =>
        button.setButtonText('Create Folders').onClick(async () => {
          const created = await this.plugin.createFolderStructure();
          if (created.length > 0) {
            new Notice(`Created folders: ${created.join(', ')}`);
          } else {
            new Notice('All SBF folders already exist');
          }
        })
      );

    new Setting(containerEl)
      .setName('Reset Settings')
      .setDesc('Reset all settings to defaults')
      .addButton((button) =>
        button
          .setButtonText('Reset')
          .setWarning()
          .onClick(async () => {
            this.plugin.settings = { ...DEFAULT_SETTINGS };
            await this.plugin.saveSettings();
            this.display();
            new Notice('Settings reset to defaults');
          })
      );

    // About Section
    containerEl.createEl('h2', { text: 'ℹ️ About', cls: 'sbf-settings-header' });

    const aboutDiv = containerEl.createDiv();
    aboutDiv.innerHTML = `
      <p><strong>Second Brain Foundation Companion</strong></p>
      <p>Version: ${this.plugin.manifest.version}</p>
      <p>
        <a href="https://github.com/sbf/obsidian-plugin">GitHub</a> | 
        <a href="https://docs.secondbrainfoundation.com">Documentation</a>
      </p>
    `;
  }
}
