/**
 * SyncStatusBar - Status Bar Component
 * 
 * Shows sync status in Obsidian's status bar.
 */

import { Plugin, setIcon } from 'obsidian';
import { SyncStatus, SyncResult } from '../types';

export class SyncStatusBar {
  private statusBarEl: HTMLElement;
  private iconEl: HTMLElement;
  private textEl: HTMLElement;
  private status: SyncStatus = 'offline';
  private lastSync?: Date;

  constructor(private plugin: Plugin) {
    this.statusBarEl = plugin.addStatusBarItem();
    this.statusBarEl.addClass('sbf-status-bar');
    this.statusBarEl.setAttribute('aria-label', 'SBF Sync Status');
    
    // Create icon element
    this.iconEl = this.statusBarEl.createSpan({ cls: 'sbf-status-icon' });
    
    // Create text element
    this.textEl = this.statusBarEl.createSpan({ cls: 'sbf-status-text' });
    
    // Click to trigger sync
    this.statusBarEl.addEventListener('click', () => {
      this.plugin.app.commands.executeCommandById('sbf-companion:sync-now');
    });
    
    this.render();
  }

  /**
   * Set sync status
   */
  setStatus(status: SyncStatus, message?: string): void {
    this.status = status;
    this.render(message);
  }

  /**
   * Set syncing state with progress
   */
  setSyncing(current: number, total: number): void {
    this.status = 'syncing';
    this.render(`${current}/${total}`);
  }

  /**
   * Set sync complete
   */
  setSyncComplete(result: SyncResult): void {
    this.lastSync = result.completedAt;
    
    if (result.errors.length > 0) {
      this.setStatus('error', `${result.errors.length} errors`);
    } else {
      this.setStatus('synced', `${result.uploaded}↑ ${result.downloaded}↓`);
    }
  }

  /**
   * Hide the status bar
   */
  hide(): void {
    this.statusBarEl.hide();
  }

  /**
   * Show the status bar
   */
  show(): void {
    this.statusBarEl.show();
  }

  /**
   * Render current status
   */
  private render(message?: string): void {
    // Update icon
    this.iconEl.empty();
    this.iconEl.removeClass('synced', 'syncing', 'error', 'offline', 'pending');
    this.iconEl.addClass(this.status);
    
    // Set icon based on status
    switch (this.status) {
      case 'synced':
        setIcon(this.iconEl, 'check-circle');
        break;
      case 'syncing':
        setIcon(this.iconEl, 'refresh-cw');
        this.iconEl.addClass('spinning');
        break;
      case 'error':
        setIcon(this.iconEl, 'alert-circle');
        break;
      case 'pending':
        setIcon(this.iconEl, 'clock');
        break;
      case 'offline':
      default:
        setIcon(this.iconEl, 'cloud-off');
        break;
    }
    
    // Update text
    let displayText = 'SBF';
    
    if (message) {
      displayText = `SBF: ${message}`;
    } else {
      switch (this.status) {
        case 'synced':
          displayText = this.lastSync 
            ? `SBF: ${this.formatRelativeTime(this.lastSync)}`
            : 'SBF: Synced';
          break;
        case 'syncing':
          displayText = 'SBF: Syncing...';
          break;
        case 'error':
          displayText = 'SBF: Error';
          break;
        case 'pending':
          displayText = 'SBF: Pending';
          break;
        case 'offline':
          displayText = 'SBF: Offline';
          break;
      }
    }
    
    this.textEl.setText(displayText);
    
    // Update tooltip
    this.statusBarEl.setAttribute(
      'aria-label',
      this.getTooltip()
    );
  }

  /**
   * Get tooltip text
   */
  private getTooltip(): string {
    const lines = ['SBF Companion'];
    
    switch (this.status) {
      case 'synced':
        lines.push('Status: Synced');
        break;
      case 'syncing':
        lines.push('Status: Syncing...');
        break;
      case 'error':
        lines.push('Status: Error occurred during sync');
        break;
      case 'pending':
        lines.push('Status: Changes pending sync');
        break;
      case 'offline':
        lines.push('Status: Not connected');
        break;
    }
    
    if (this.lastSync) {
      lines.push(`Last sync: ${this.lastSync.toLocaleString()}`);
    }
    
    lines.push('Click to sync now');
    
    return lines.join('\n');
  }

  /**
   * Format relative time
   */
  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.statusBarEl.remove();
  }
}
