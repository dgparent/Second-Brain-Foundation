/**
 * Dissolution Queue Component
 * Manages entities pending dissolution with human override controls
 */

export interface DissolutionCandidate {
  id: string;
  title: string;
  type: string;
  content: string;
  createdAt: Date;
  lastModified: Date;
  daysSinceModified: number;
  scheduledDissolution: Date;
  dissolutionReason: string;
  canPrevent: boolean;
  canPostpone: boolean;
}

export interface DissolutionQueueOptions {
  onPrevent?: (entityId: string, reason: string) => Promise<void>;
  onPostpone?: (entityId: string, days: number) => Promise<void>;
  onApprove?: (entityId: string) => Promise<void>;
  onView?: (entityId: string) => void;
}

export class DissolutionQueue {
  private container: HTMLElement;
  private options: DissolutionQueueOptions;
  private candidates: DissolutionCandidate[] = [];
  private selectedEntity: DissolutionCandidate | null = null;
  private showPreview: boolean = false;

  constructor(container: HTMLElement, options: DissolutionQueueOptions = {}) {
    this.container = container;
    this.options = options;
    this.loadQueue();
  }

  private async loadQueue(): Promise<void> {
    try {
      const candidates = await (window as any).electron.invoke('lifecycle:getDissolutionQueue');
      this.candidates = candidates.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastModified: new Date(c.lastModified),
        scheduledDissolution: new Date(c.scheduledDissolution),
      }));
      this.render();
    } catch (error) {
      console.error('Failed to load dissolution queue:', error);
      this.renderError();
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="dissolution-queue">
        ${this.renderHeader()}
        ${this.candidates.length > 0 
          ? this.renderQueue()
          : this.renderEmpty()
        }
        ${this.showPreview && this.selectedEntity ? this.renderPreview() : ''}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderHeader(): string {
    const urgentCount = this.candidates.filter(c => {
      const daysUntil = Math.floor(
        (c.scheduledDissolution.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntil <= 7;
    }).length;

    return `
      <div class="queue-header">
        <div class="queue-title">
          <h3>⏰ Dissolution Queue</h3>
          <p class="queue-subtitle">
            ${this.candidates.length} ${this.candidates.length === 1 ? 'entity' : 'entities'} pending dissolution
            ${urgentCount > 0 ? `<span class="urgent-badge">${urgentCount} urgent</span>` : ''}
          </p>
        </div>
        <button class="btn-refresh-queue" data-action="refresh">
          🔄 Refresh
        </button>
      </div>
    `;
  }

  private renderQueue(): string {
    return `
      <div class="queue-list">
        ${this.candidates.map(candidate => this.renderCandidate(candidate)).join('')}
      </div>
    `;
  }

  private renderCandidate(candidate: DissolutionCandidate): string {
    const daysUntil = Math.floor(
      (candidate.scheduledDissolution.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    const isUrgent = daysUntil <= 7;
    const urgencyClass = isUrgent ? 'urgent' : daysUntil <= 14 ? 'warning' : '';

    return `
      <div class="queue-item ${urgencyClass}" data-entity-id="${candidate.id}">
        <div class="item-header">
          <div class="item-title-section">
            <div class="item-icon">${isUrgent ? '🔴' : '📋'}</div>
            <div class="item-info">
              <div class="item-title">${this.escapeHtml(candidate.title)}</div>
              <div class="item-meta">
                <span class="item-type">${candidate.type}</span>
                <span class="meta-separator">•</span>
                <span class="item-age">${candidate.daysSinceModified} days inactive</span>
              </div>
            </div>
          </div>
          <div class="item-schedule">
            <div class="schedule-label">Scheduled for:</div>
            <div class="schedule-date ${isUrgent ? 'urgent-text' : ''}">
              ${this.formatScheduleDate(candidate.scheduledDissolution)}
              (${daysUntil >= 0 ? `in ${daysUntil} days` : `${Math.abs(daysUntil)} days overdue`})
            </div>
          </div>
        </div>

        <div class="item-reason">
          <strong>Reason:</strong> ${this.escapeHtml(candidate.dissolutionReason)}
        </div>

        <div class="item-actions">
          <button 
            class="btn-action btn-preview" 
            data-action="preview" 
            data-entity-id="${candidate.id}"
            title="Preview entity content"
          >
            👁️ Preview
          </button>
          ${candidate.canPrevent ? `
            <button 
              class="btn-action btn-prevent" 
              data-action="prevent" 
              data-entity-id="${candidate.id}"
              title="Prevent dissolution permanently"
            >
              🛑 Prevent
            </button>
          ` : ''}
          ${candidate.canPostpone ? `
            <button 
              class="btn-action btn-postpone" 
              data-action="postpone" 
              data-entity-id="${candidate.id}"
              title="Postpone dissolution"
            >
              ⏸️ Postpone
            </button>
          ` : ''}
          <button 
            class="btn-action btn-approve" 
            data-action="approve" 
            data-entity-id="${candidate.id}"
            title="Approve dissolution now"
          >
            ✅ Approve
          </button>
        </div>
      </div>
    `;
  }

  private renderEmpty(): string {
    return `
      <div class="queue-empty">
        <div class="empty-icon">✨</div>
        <div class="empty-title">No entities pending dissolution</div>
        <div class="empty-subtitle">
          All entities are either active or have been processed
        </div>
      </div>
    `;
  }

  private renderPreview(): string {
    if (!this.selectedEntity) return '';

    const entity = this.selectedEntity;
    const contentPreview = entity.content.substring(0, 1000);
    const isTruncated = entity.content.length > 1000;

    return `
      <div class="preview-overlay" data-action="close-preview">
        <div class="preview-modal" data-stop-propagation="true">
          <div class="preview-header">
            <h3>Preview: ${this.escapeHtml(entity.title)}</h3>
            <button class="btn-close-preview" data-action="close-preview">✕</button>
          </div>
          <div class="preview-meta">
            <span><strong>Type:</strong> ${entity.type}</span>
            <span><strong>Created:</strong> ${entity.createdAt.toLocaleDateString()}</span>
            <span><strong>Last Modified:</strong> ${entity.lastModified.toLocaleDateString()}</span>
            <span><strong>Days Inactive:</strong> ${entity.daysSinceModified}</span>
          </div>
          <div class="preview-content">
            <pre>${this.escapeHtml(contentPreview)}</pre>
            ${isTruncated ? '<div class="content-truncated">... (content truncated)</div>' : ''}
          </div>
          <div class="preview-actions">
            <button class="btn-action btn-view-full" data-action="view-full" data-entity-id="${entity.id}">
              View Full Entity
            </button>
            <button class="btn-action btn-prevent" data-action="prevent" data-entity-id="${entity.id}">
              🛑 Prevent Dissolution
            </button>
            <button class="btn-action btn-postpone" data-action="postpone" data-entity-id="${entity.id}">
              ⏸️ Postpone
            </button>
            <button class="btn-action btn-approve" data-action="approve" data-entity-id="${entity.id}">
              ✅ Approve Dissolution
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private renderError(): void {
    this.container.innerHTML = `
      <div class="queue-error">
        <div class="error-icon">⚠️</div>
        <div class="error-text">Failed to load dissolution queue</div>
        <button class="btn-retry" data-action="refresh">Try Again</button>
      </div>
    `;
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    // Refresh
    this.container.querySelectorAll('[data-action="refresh"]').forEach(btn => {
      btn.addEventListener('click', () => this.refresh());
    });

    // Preview
    this.container.querySelectorAll('[data-action="preview"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        this.showPreviewFor(entityId);
      });
    });

    // Close preview
    this.container.querySelectorAll('[data-action="close-preview"]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Don't close if clicking inside modal
        if ((e.target as HTMLElement).dataset.stopPropagation !== 'true' &&
            !(e.target as HTMLElement).closest('[data-stop-propagation="true"]')) {
          this.closePreview();
        }
      });
    });

    // View full
    this.container.querySelectorAll('[data-action="view-full"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        if (this.options.onView) {
          this.options.onView(entityId);
        }
        this.closePreview();
      });
    });

    // Prevent
    this.container.querySelectorAll('[data-action="prevent"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        this.handlePrevent(entityId);
      });
    });

    // Postpone
    this.container.querySelectorAll('[data-action="postpone"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        this.handlePostpone(entityId);
      });
    });

    // Approve
    this.container.querySelectorAll('[data-action="approve"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const entityId = (e.currentTarget as HTMLElement).dataset.entityId!;
        this.handleApprove(entityId);
      });
    });
  }

  private showPreviewFor(entityId: string): void {
    this.selectedEntity = this.candidates.find(c => c.id === entityId) || null;
    this.showPreview = true;
    this.render();
  }

  private closePreview(): void {
    this.showPreview = false;
    this.selectedEntity = null;
    this.render();
  }

  private async handlePrevent(entityId: string): Promise<void> {
    const reason = prompt('Why should this entity not be dissolved?');
    if (!reason) return;

    try {
      if (this.options.onPrevent) {
        await this.options.onPrevent(entityId, reason);
      }
      // Remove from queue
      this.candidates = this.candidates.filter(c => c.id !== entityId);
      this.closePreview();
      this.render();
    } catch (error) {
      alert('Failed to prevent dissolution: ' + (error as Error).message);
    }
  }

  private async handlePostpone(entityId: string): Promise<void> {
    const days = prompt('Postpone for how many days?', '30');
    if (!days) return;

    const daysNum = parseInt(days, 10);
    if (isNaN(daysNum) || daysNum < 1) {
      alert('Please enter a valid number of days');
      return;
    }

    try {
      if (this.options.onPostpone) {
        await this.options.onPostpone(entityId, daysNum);
      }
      // Update candidate
      const candidate = this.candidates.find(c => c.id === entityId);
      if (candidate) {
        candidate.scheduledDissolution = new Date(
          candidate.scheduledDissolution.getTime() + daysNum * 24 * 60 * 60 * 1000
        );
      }
      this.closePreview();
      this.render();
    } catch (error) {
      alert('Failed to postpone dissolution: ' + (error as Error).message);
    }
  }

  private async handleApprove(entityId: string): Promise<void> {
    const confirmed = confirm(
      'Are you sure you want to approve this dissolution?\n\n' +
      'The entity content will be extracted into permanent knowledge and the file will be removed.'
    );
    if (!confirmed) return;

    try {
      if (this.options.onApprove) {
        await this.options.onApprove(entityId);
      }
      // Remove from queue
      this.candidates = this.candidates.filter(c => c.id !== entityId);
      this.closePreview();
      this.render();
    } catch (error) {
      alert('Failed to approve dissolution: ' + (error as Error).message);
    }
  }

  private formatScheduleDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  public refresh(): void {
    this.loadQueue();
  }

  public destroy(): void {
    this.container.innerHTML = '';
  }
}

// Component CSS
export const DISSOLUTION_QUEUE_CSS = `
.dissolution-queue {
  padding: 1.5rem;
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.queue-title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin: 0 0 0.5rem 0;
}

.queue-subtitle {
  color: #999;
  margin: 0;
}

.urgent-badge {
  display: inline-block;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 12px;
}

.btn-refresh-queue {
  padding: 0.625rem 1rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh-queue:hover {
  background: #3d3d3d;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.queue-item {
  padding: 1.25rem;
  background: #2d2d2d;
  border: 1px solid #444;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  transition: all 0.2s;
}

.queue-item.warning {
  border-left-color: #f59e0b;
}

.queue-item.urgent {
  border-left-color: #ef4444;
  background: #2d1f1f;
}

.queue-item:hover {
  background: #3d3d3d;
  transform: translateY(-1px);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-title-section {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
}

.item-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.25rem;
}

.item-meta {
  font-size: 0.875rem;
  color: #999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-separator {
  color: #666;
}

.item-schedule {
  text-align: right;
  flex-shrink: 0;
}

.schedule-label {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.schedule-date {
  font-size: 0.875rem;
  color: #e0e0e0;
  font-weight: 500;
}

.schedule-date.urgent-text {
  color: #ef4444;
}

.item-reason {
  padding: 0.75rem;
  background: #242424;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #ccc;
  margin-bottom: 1rem;
}

.item-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.5rem 1rem;
  border: 1px solid #444;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-preview {
  background: #2d2d2d;
  color: #e0e0e0;
}

.btn-preview:hover {
  background: #3d3d3d;
}

.btn-prevent {
  background: #2d2d2d;
  color: #ef4444;
  border-color: #ef4444;
}

.btn-prevent:hover {
  background: #ef4444;
  color: white;
}

.btn-postpone {
  background: #2d2d2d;
  color: #f59e0b;
  border-color: #f59e0b;
}

.btn-postpone:hover {
  background: #f59e0b;
  color: white;
}

.btn-approve {
  background: #2d2d2d;
  color: #10b981;
  border-color: #10b981;
}

.btn-approve:hover {
  background: #10b981;
  color: white;
}

.queue-empty,
.queue-error {
  padding: 4rem 2rem;
  text-align: center;
  background: #2d2d2d;
  border-radius: 8px;
}

.empty-icon,
.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-title,
.error-text {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.empty-subtitle {
  color: #999;
}

.btn-retry {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
}

.btn-retry:hover {
  background: #2563eb;
}

/* Preview Modal */
.preview-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-modal {
  background: #2d2d2d;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #444;
}

.preview-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #e0e0e0;
}

.btn-close-preview {
  padding: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close-preview:hover {
  color: #e0e0e0;
}

.preview-meta {
  display: flex;
  gap: 1.5rem;
  padding: 1rem 1.5rem;
  background: #242424;
  border-bottom: 1px solid #444;
  font-size: 0.875rem;
  color: #999;
  flex-wrap: wrap;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.preview-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: #e0e0e0;
}

.content-truncated {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #242424;
  border-radius: 6px;
  text-align: center;
  color: #999;
  font-style: italic;
}

.preview-actions {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #444;
}

.btn-view-full {
  flex: 1;
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-view-full:hover {
  background: #2563eb;
}
`;
