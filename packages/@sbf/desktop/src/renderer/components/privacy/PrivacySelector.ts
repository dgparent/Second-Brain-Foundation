/**
 * Privacy Selector Component
 * Allows users to select privacy level for entities
 */

export enum PrivacyLevel {
  Public = 0,
  Personal = 1,
  Private = 2,
  Confidential = 3,
}

export interface PrivacyConfig {
  level: PrivacyLevel;
  icon: string;
  color: string;
  label: string;
  description: string;
}

export const PRIVACY_CONFIGS: Record<PrivacyLevel, PrivacyConfig> = {
  [PrivacyLevel.Public]: {
    level: PrivacyLevel.Public,
    icon: '🌍',
    color: '#10b981',
    label: 'Public',
    description: 'Can be shared with any AI provider',
  },
  [PrivacyLevel.Personal]: {
    level: PrivacyLevel.Personal,
    icon: '👤',
    color: '#f59e0b',
    label: 'Personal',
    description: 'Local AI or trusted providers only (filtered)',
  },
  [PrivacyLevel.Private]: {
    level: PrivacyLevel.Private,
    icon: '🔒',
    color: '#f97316',
    label: 'Private',
    description: 'Local AI only, no third-party access',
  },
  [PrivacyLevel.Confidential]: {
    level: PrivacyLevel.Confidential,
    icon: '🚫',
    color: '#ef4444',
    label: 'Confidential',
    description: 'No AI processing allowed',
  },
};

export class PrivacySelector {
  private container: HTMLElement;
  private currentLevel: PrivacyLevel = PrivacyLevel.Personal;
  private onChange: (level: PrivacyLevel) => void;

  constructor(container: HTMLElement, initialLevel: PrivacyLevel = PrivacyLevel.Personal) {
    this.container = container;
    this.currentLevel = initialLevel;
    this.onChange = () => {};
    this.render();
  }

  setLevel(level: PrivacyLevel): void {
    this.currentLevel = level;
    this.render();
  }

  getLevel(): PrivacyLevel {
    return this.currentLevel;
  }

  onLevelChange(callback: (level: PrivacyLevel) => void): void {
    this.onChange = callback;
  }

  private render(): void {
    const config = PRIVACY_CONFIGS[this.currentLevel];

    this.container.innerHTML = `
      <div class="privacy-selector">
        <div class="privacy-current" style="border-color: ${config.color};">
          <span class="privacy-icon">${config.icon}</span>
          <div class="privacy-info">
            <div class="privacy-label" style="color: ${config.color};">${config.label}</div>
            <div class="privacy-description">${config.description}</div>
          </div>
        </div>
        <div class="privacy-options">
          ${Object.values(PRIVACY_CONFIGS).map(cfg => `
            <button 
              class="privacy-option ${cfg.level === this.currentLevel ? 'active' : ''}"
              data-level="${cfg.level}"
              style="border-color: ${cfg.color}; ${cfg.level === this.currentLevel ? `background: ${cfg.color}15;` : ''}"
              title="${cfg.description}"
            >
              <span class="privacy-icon">${cfg.icon}</span>
              <span class="privacy-label">${cfg.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Add click handlers
    this.container.querySelectorAll('.privacy-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const level = parseInt((e.currentTarget as HTMLElement).dataset.level || '1', 10);
        this.currentLevel = level as PrivacyLevel;
        this.render();
        this.onChange(this.currentLevel);
      });
    });
  }
}

// CSS for privacy selector (to be added to main stylesheet)
export const PRIVACY_SELECTOR_CSS = `
.privacy-selector {
  padding: 1rem;
  background: #2d2d2d;
  border-radius: 8px;
  margin: 1rem 0;
}

.privacy-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #242424;
  border-radius: 6px;
  border-left: 4px solid;
  margin-bottom: 1rem;
}

.privacy-icon {
  font-size: 1.5rem;
}

.privacy-info {
  flex: 1;
}

.privacy-label {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.privacy-description {
  font-size: 0.875rem;
  color: #999;
}

.privacy-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.privacy-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #242424;
  border: 2px solid;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #e0e0e0;
  font-size: 0.875rem;
}

.privacy-option:hover {
  background: #3d3d3d;
}

.privacy-option.active {
  font-weight: 600;
}

.privacy-option .privacy-label {
  color: inherit;
}
`;
