/**
 * ConflictModal - Conflict Resolution UI
 * 
 * Modal for resolving sync conflicts between local and remote versions.
 */

import { App, Modal, ButtonComponent, setIcon } from 'obsidian';
import { SyncConflict } from '../types';
import { ConflictResolver, ConflictSummary } from '../sync/ConflictResolver';

export type ConflictResolution = 'local' | 'remote' | 'merge' | 'skip';

export interface ConflictModalResult {
  conflict: SyncConflict;
  resolution: ConflictResolution;
  mergedContent?: string;
}

export class ConflictModal extends Modal {
  private conflicts: SyncConflict[];
  private resolver: ConflictResolver;
  private results: ConflictModalResult[] = [];
  private currentIndex = 0;
  private resolveCallback: (results: ConflictModalResult[]) => void;
  private applyAllResolution?: ConflictResolution;

  constructor(
    app: App,
    conflicts: SyncConflict[],
    onResolve: (results: ConflictModalResult[]) => void
  ) {
    super(app);
    this.conflicts = conflicts;
    this.resolver = new ConflictResolver();
    this.resolveCallback = onResolve;
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass('sbf-conflict-modal');
    
    this.renderConflict();
  }

  onClose(): void {
    // If closed without resolving all, skip remaining
    while (this.results.length < this.conflicts.length) {
      const conflict = this.conflicts[this.results.length];
      this.results.push({
        conflict,
        resolution: 'skip',
      });
    }
    
    this.resolveCallback(this.results);
  }

  /**
   * Render current conflict
   */
  private renderConflict(): void {
    const { contentEl } = this;
    contentEl.empty();
    
    const conflict = this.conflicts[this.currentIndex];
    const summary = this.resolver.getSummary(conflict);
    
    // Header
    const header = contentEl.createDiv({ cls: 'sbf-conflict-header' });
    
    const title = header.createEl('h2');
    setIcon(title.createSpan(), 'alert-triangle');
    title.createSpan({ text: ` Sync Conflict (${this.currentIndex + 1}/${this.conflicts.length})` });
    
    // File info
    const infoDiv = contentEl.createDiv({ cls: 'sbf-conflict-info' });
    infoDiv.createEl('p', { text: `File: ${summary.path}` });
    infoDiv.createEl('p', { text: `UID: ${summary.uid}` });
    infoDiv.createEl('p', { 
      text: `Similarity: ${Math.round(summary.similarity * 100)}%`,
      cls: summary.similarity > 0.8 ? 'sbf-similarity-high' : 'sbf-similarity-low'
    });
    
    // Preview containers
    const previewContainer = contentEl.createDiv({ cls: 'sbf-conflict-preview' });
    
    // Local version
    const localDiv = previewContainer.createDiv({ cls: 'sbf-conflict-side local' });
    const localHeader = localDiv.createDiv({ cls: 'sbf-conflict-side-header' });
    setIcon(localHeader.createSpan(), 'file');
    localHeader.createSpan({ text: ' Local Version' });
    localHeader.createEl('span', { 
      text: ` (${this.formatDate(summary.localMtime)})`,
      cls: 'sbf-timestamp'
    });
    
    const localPreview = localDiv.createEl('pre', { cls: 'sbf-conflict-content' });
    localPreview.setText(summary.localPreview);
    localDiv.createEl('p', { text: `${summary.localWordCount} words`, cls: 'sbf-word-count' });
    
    // Remote version
    const remoteDiv = previewContainer.createDiv({ cls: 'sbf-conflict-side remote' });
    const remoteHeader = remoteDiv.createDiv({ cls: 'sbf-conflict-side-header' });
    setIcon(remoteHeader.createSpan(), 'cloud');
    remoteHeader.createSpan({ text: ' Remote Version' });
    remoteHeader.createEl('span', { 
      text: ` (${this.formatDate(summary.remoteMtime)})`,
      cls: 'sbf-timestamp'
    });
    
    const remotePreview = remoteDiv.createEl('pre', { cls: 'sbf-conflict-content' });
    remotePreview.setText(summary.remotePreview);
    remoteDiv.createEl('p', { text: `${summary.remoteWordCount} words`, cls: 'sbf-word-count' });
    
    // Actions
    const actionsDiv = contentEl.createDiv({ cls: 'sbf-conflict-actions' });
    
    // Resolution buttons
    const buttonRow = actionsDiv.createDiv({ cls: 'sbf-conflict-buttons' });
    
    new ButtonComponent(buttonRow)
      .setButtonText('Keep Local')
      .setClass('mod-cta')
      .onClick(() => this.resolveWith('local'));
    
    new ButtonComponent(buttonRow)
      .setButtonText('Keep Remote')
      .onClick(() => this.resolveWith('remote'));
    
    new ButtonComponent(buttonRow)
      .setButtonText('Merge Both')
      .onClick(() => this.resolveWith('merge'));
    
    new ButtonComponent(buttonRow)
      .setButtonText('Skip')
      .onClick(() => this.resolveWith('skip'));
    
    // Apply to all
    if (this.conflicts.length > 1) {
      const applyAllRow = actionsDiv.createDiv({ cls: 'sbf-conflict-apply-all' });
      applyAllRow.createEl('span', { text: 'Apply to all: ' });
      
      new ButtonComponent(applyAllRow)
        .setButtonText('All Local')
        .onClick(() => this.applyToAll('local'));
      
      new ButtonComponent(applyAllRow)
        .setButtonText('All Remote')
        .onClick(() => this.applyToAll('remote'));
      
      new ButtonComponent(applyAllRow)
        .setButtonText('All Newest')
        .onClick(() => this.applyToAllNewest());
    }
  }

  /**
   * Resolve current conflict with given resolution
   */
  private resolveWith(resolution: ConflictResolution): void {
    const conflict = this.conflicts[this.currentIndex];
    
    const result: ConflictModalResult = {
      conflict,
      resolution,
    };
    
    // Generate merge if needed
    if (resolution === 'merge') {
      result.mergedContent = this.resolver.generateMerge(
        conflict.localContent,
        conflict.remoteContent
      );
    }
    
    this.results.push(result);
    this.nextConflict();
  }

  /**
   * Move to next conflict or close
   */
  private nextConflict(): void {
    this.currentIndex++;
    
    if (this.currentIndex >= this.conflicts.length) {
      this.close();
    } else {
      this.renderConflict();
    }
  }

  /**
   * Apply same resolution to all remaining conflicts
   */
  private applyToAll(resolution: ConflictResolution): void {
    for (let i = this.currentIndex; i < this.conflicts.length; i++) {
      const conflict = this.conflicts[i];
      const result: ConflictModalResult = {
        conflict,
        resolution,
      };
      
      if (resolution === 'merge') {
        result.mergedContent = this.resolver.generateMerge(
          conflict.localContent,
          conflict.remoteContent
        );
      }
      
      this.results.push(result);
    }
    
    this.close();
  }

  /**
   * Apply newest-wins to all remaining
   */
  private applyToAllNewest(): void {
    for (let i = this.currentIndex; i < this.conflicts.length; i++) {
      const conflict = this.conflicts[i];
      const resolution: ConflictResolution = 
        conflict.localMtime > conflict.remoteMtime ? 'local' : 'remote';
      
      this.results.push({
        conflict,
        resolution,
      });
    }
    
    this.close();
  }

  /**
   * Format date for display
   */
  private formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMins = Math.floor(diff / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}
