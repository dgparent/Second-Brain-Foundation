/**
 * Notification Center Component
 * 
 * Manages notifications for lifecycle events, pending dissolutions, and system alerts.
 * Features:
 * - Desktop notifications for pending dissolutions
 * - In-app notification center
 * - Notification preferences
 * - Mark as read/dismissed
 * - Priority-based organization
 */

export interface Notification {
  id: string;
  type: 'dissolution' | 'lifecycle' | 'privacy' | 'system';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  entityId?: string;
  entityTitle?: string;
  timestamp: Date;
  read: boolean;
  dismissed: boolean;
  actionable: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  params?: Record<string, any>;
}

export interface NotificationSettings {
  enableDesktopNotifications: boolean;
  enableSoundAlerts: boolean;
  urgentOnly: boolean;
  dissolution: boolean;
  lifecycle: boolean;
  privacy: boolean;
  system: boolean;
}

export interface NotificationCenterOptions {
  onActionClick?: (action: string, params: Record<string, any>) => void;
  onSettingsChange?: (settings: NotificationSettings) => void;
  maxNotifications?: number;
}

export class NotificationCenter {
  private container: HTMLElement;
  private options: NotificationCenterOptions;
  private notifications: Notification[] = [];
  private settings: NotificationSettings = {
    enableDesktopNotifications: true,
    enableSoundAlerts: true,
    urgentOnly: false,
    dissolution: true,
    lifecycle: true,
    privacy: true,
    system: true,
  };
  private isOpen: boolean = false;

  constructor(container: HTMLElement, options: NotificationCenterOptions = {}) {
    this.container = container;
    this.options = {
      maxNotifications: 50,
      ...options,
    };
    this.initialize();
  }

  private async initialize() {
    await this.loadNotifications();
    await this.loadSettings();
    this.render();
    this.startPolling();
  }

  private async loadNotifications() {
    try {
      const result = await window.sbfAPI.notifications.getAll();
      this.notifications = result.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp),
      }));
    } catch (error) {
      console.error('Failed to load notifications:', error);
      this.notifications = [];
    }
  }

  private async loadSettings() {
    try {
      // TODO: Implement notifications settings API
      this.settings = {
        enableDesktopNotifications: true,
        urgentOnly: false,
        soundEnabled: true,
        dissolution_pending: true,
        lifecycle_event: true,
        privacy_alert: true,
        system_notification: true,
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private startPolling() {
    setInterval(async () => {
      const oldCount = this.unreadCount;
      await this.loadNotifications();
      const newCount = this.unreadCount;
      
      if (newCount > oldCount) {
        this.showNewNotifications();
      }
      
      this.render();
    }, 30000); // Poll every 30 seconds
  }

  private showNewNotifications() {
    const newNotifications = this.notifications.filter(n => !n.read && !n.dismissed);
    
    if (this.settings.enableDesktopNotifications) {
      newNotifications.forEach(notification => {
        if (this.settings.urgentOnly && notification.priority !== 'urgent') {
          return;
        }
        
        if (!this.isNotificationTypeEnabled(notification.type)) {
          return;
        }
        
        // TODO: Implement desktop notification API
        // window.sbfAPI.notifications.showDesktop({
        //   title: notification.title,
        //   body: notification.message,
        //   priority: notification.priority,
        // });
      });
    }
  }

  private isNotificationTypeEnabled(type: string): boolean {
    return this.settings[type as keyof NotificationSettings] === true;
  }

  private get unreadCount(): number {
    return this.notifications.filter(n => !n.read && !n.dismissed).length;
  }

  private get urgentCount(): number {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.read && !n.dismissed).length;
  }

  public toggle() {
    this.isOpen = !this.isOpen;
    this.render();
  }

  public async markAsRead(notificationId: string) {
    try {
      await window.sbfAPI.notifications.markAsRead(notificationId);
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      this.render();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }

  public async markAllAsRead() {
    try {
      // TODO: Implement mark all as read API
      this.notifications.forEach(n => n.read = true);
      this.render();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  public async dismiss(notificationId: string) {
    try {
      await window.sbfAPI.notifications.dismiss(notificationId);
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.dismissed = true;
      }
      this.render();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }

  public async clearAll() {
    try {
      // TODO: Implement clear all notifications API
      this.notifications = [];
      this.render();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  }

  private async updateSettings(updates: Partial<NotificationSettings>) {
    try {
      this.settings = { ...this.settings, ...updates };
      // TODO: Implement update settings API
      this.options.onSettingsChange?.(this.settings);
      this.render();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  private handleAction(action: string, params: Record<string, any>) {
    this.options.onActionClick?.(action, params);
  }

  private render() {
    const activeNotifications = this.notifications.filter(n => !n.dismissed);
    const unread = activeNotifications.filter(n => !n.read);
    
    this.container.innerHTML = `
      <div class="notification-center">
        ${this.renderBell()}
        ${this.isOpen ? this.renderPanel(activeNotifications, unread) : ''}
      </div>
    `;
    
    this.attachEventListeners();
  }

  private renderBell(): string {
    const count = this.unreadCount;
    const hasUrgent = this.urgentCount > 0;
    
    return `
      <button class="notification-bell ${hasUrgent ? 'urgent' : ''}" data-action="toggle">
        <svg class="bell-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        ${count > 0 ? `<span class="notification-badge ${hasUrgent ? 'urgent' : ''}">${count > 99 ? '99+' : count}</span>` : ''}
      </button>
    `;
  }

  private renderPanel(activeNotifications: Notification[], unread: Notification[]): string {
    return `
      <div class="notification-panel">
        <div class="notification-header">
          <h3>Notifications</h3>
          <div class="notification-actions">
            ${unread.length > 0 ? `<button class="btn-text" data-action="mark-all-read">Mark all read</button>` : ''}
            ${activeNotifications.length > 0 ? `<button class="btn-text" data-action="clear-all">Clear all</button>` : ''}
            <button class="btn-icon" data-action="settings">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="notification-list">
          ${activeNotifications.length === 0 ? this.renderEmpty() : activeNotifications.map(n => this.renderNotification(n)).join('')}
        </div>
      </div>
    `;
  }

  private renderEmpty(): string {
    return `
      <div class="notification-empty">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>You're all caught up!</p>
        <p class="text-muted">No new notifications</p>
      </div>
    `;
  }

  private renderNotification(notification: Notification): string {
    const timeAgo = this.formatTimeAgo(notification.timestamp);
    const priorityClass = notification.priority === 'urgent' ? 'urgent' : notification.priority === 'high' ? 'high' : '';
    
    return `
      <div class="notification-item ${notification.read ? 'read' : 'unread'} ${priorityClass}" 
           data-notification-id="${notification.id}">
        <div class="notification-indicator ${notification.priority}"></div>
        <div class="notification-content">
          <div class="notification-title-row">
            <span class="notification-type-badge ${notification.type}">${notification.type}</span>
            <span class="notification-time">${timeAgo}</span>
          </div>
          <h4 class="notification-title">${notification.title}</h4>
          <p class="notification-message">${notification.message}</p>
          ${notification.entityTitle ? `<p class="notification-entity">Entity: ${notification.entityTitle}</p>` : ''}
          ${notification.actions && notification.actions.length > 0 ? this.renderActions(notification) : ''}
        </div>
        <div class="notification-controls">
          ${!notification.read ? `<button class="btn-icon-small" data-action="mark-read" data-id="${notification.id}" title="Mark as read">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>` : ''}
          <button class="btn-icon-small" data-action="dismiss" data-id="${notification.id}" title="Dismiss">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  private renderActions(notification: Notification): string {
    return `
      <div class="notification-actions-list">
        ${notification.actions!.map(action => `
          <button class="notification-action-btn" 
                  data-action="notification-action"
                  data-notification-id="${notification.id}"
                  data-action-name="${action.action}"
                  data-action-params='${JSON.stringify(action.params || {})}'>
            ${action.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  private renderSettings(): string {
    return `
      <div class="notification-settings-panel">
        <div class="settings-header">
          <h3>Notification Settings</h3>
          <button class="btn-icon" data-action="close-settings">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="settings-content">
          <div class="setting-group">
            <h4>General</h4>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="enableDesktopNotifications" 
                     ${this.settings.enableDesktopNotifications ? 'checked' : ''}>
              <span>Enable desktop notifications</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="enableSoundAlerts" 
                     ${this.settings.enableSoundAlerts ? 'checked' : ''}>
              <span>Enable sound alerts</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="urgentOnly" 
                     ${this.settings.urgentOnly ? 'checked' : ''}>
              <span>Show only urgent notifications</span>
            </label>
          </div>
          <div class="setting-group">
            <h4>Notification Types</h4>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="dissolution" 
                     ${this.settings.dissolution ? 'checked' : ''}>
              <span>Dissolution events</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="lifecycle" 
                     ${this.settings.lifecycle ? 'checked' : ''}>
              <span>Lifecycle events</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="privacy" 
                     ${this.settings.privacy ? 'checked' : ''}>
              <span>Privacy alerts</span>
            </label>
            <label class="setting-item">
              <input type="checkbox" 
                     data-setting="system" 
                     ${this.settings.system ? 'checked' : ''}>
              <span>System notifications</span>
            </label>
          </div>
        </div>
      </div>
    `;
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  private attachEventListeners() {
    // Toggle notification panel
    const bellBtn = this.container.querySelector('[data-action="toggle"]');
    bellBtn?.addEventListener('click', () => this.toggle());

    // Mark all as read
    const markAllBtn = this.container.querySelector('[data-action="mark-all-read"]');
    markAllBtn?.addEventListener('click', () => this.markAllAsRead());

    // Clear all
    const clearAllBtn = this.container.querySelector('[data-action="clear-all"]');
    clearAllBtn?.addEventListener('click', () => {
      if (confirm('Clear all notifications?')) {
        this.clearAll();
      }
    });

    // Mark single as read
    this.container.querySelectorAll('[data-action="mark-read"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        this.markAsRead(id);
      });
    });

    // Dismiss notification
    this.container.querySelectorAll('[data-action="dismiss"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id!;
        this.dismiss(id);
      });
    });

    // Notification actions
    this.container.querySelectorAll('[data-action="notification-action"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const elem = btn as HTMLElement;
        const notificationId = elem.dataset.notificationId!;
        const actionName = elem.dataset.actionName!;
        const params = JSON.parse(elem.dataset.actionParams || '{}');
        
        this.handleAction(actionName, params);
        await this.markAsRead(notificationId);
      });
    });

    // Settings toggle
    const settingsBtn = this.container.querySelector('[data-action="settings"]');
    settingsBtn?.addEventListener('click', () => {
      // TODO: Show settings panel
      const panel = this.renderSettings();
      // For now, just log
      console.log('Settings panel:', panel);
    });

    // Settings checkboxes
    this.container.querySelectorAll('[data-setting]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const setting = (e.target as HTMLInputElement).dataset.setting!;
        const value = (e.target as HTMLInputElement).checked;
        this.updateSettings({ [setting]: value });
      });
    });
  }

  public refresh() {
    this.loadNotifications();
  }

  public destroy() {
    this.container.innerHTML = '';
  }
}

// CSS Styles
export const NOTIFICATION_CENTER_CSS = `
.notification-center {
  position: relative;
}

.notification-bell {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #e0e0e0;
  transition: all 0.2s;
}

.notification-bell:hover {
  color: #3b82f6;
  transform: scale(1.1);
}

.notification-bell.urgent {
  color: #ef4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.bell-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  min-width: 1.25rem;
  text-align: center;
}

.notification-badge.urgent {
  background: #ef4444;
  animation: pulse 2s infinite;
}

.notification-panel {
  position: absolute;
  top: 100%;
  right: 0;
  width: 400px;
  max-height: 600px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  margin-top: 0.5rem;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #444;
}

.notification-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.btn-text:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.btn-icon {
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 0.25rem;
  width: 2rem;
  height: 2rem;
}

.btn-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-icon:hover {
  color: #3b82f6;
}

.notification-list {
  overflow-y: auto;
  max-height: 500px;
}

.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #999;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: #666;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #2d2d2d;
  position: relative;
  background: #1a1a1a;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #242424;
}

.notification-item.unread {
  background: #1e2a35;
}

.notification-item.unread:hover {
  background: #253745;
}

.notification-item.urgent {
  border-left: 3px solid #ef4444;
}

.notification-item.high {
  border-left: 3px solid #f59e0b;
}

.notification-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.5rem;
}

.notification-indicator.urgent {
  background: #ef4444;
}

.notification-indicator.high {
  background: #f59e0b;
}

.notification-indicator.normal {
  background: #3b82f6;
}

.notification-indicator.low {
  background: #666;
}

.notification-content {
  flex: 1;
}

.notification-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.notification-type-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.notification-type-badge.dissolution {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.notification-type-badge.lifecycle {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.notification-type-badge.privacy {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.notification-type-badge.system {
  background: rgba(102, 102, 102, 0.2);
  color: #999;
}

.notification-time {
  font-size: 0.75rem;
  color: #999;
}

.notification-title {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
}

.notification-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #ccc;
  line-height: 1.4;
}

.notification-entity {
  margin: 0;
  font-size: 0.75rem;
  color: #999;
}

.notification-actions-list {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.notification-action-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-action-btn:hover {
  background: #2563eb;
}

.notification-controls {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-icon-small {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
}

.btn-icon-small svg {
  width: 1rem;
  height: 1rem;
}

.btn-icon-small:hover {
  color: #e0e0e0;
}

.notification-settings-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #444;
}

.settings-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.settings-content {
  padding: 1rem;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.setting-item span {
  font-size: 0.875rem;
  color: #e0e0e0;
}

.text-muted {
  color: #999;
  font-size: 0.875rem;
}
`;
