/**
 * Privacy Indicator Component
 * Shows privacy level status with icon and color
 */

import { PrivacyLevel, PRIVACY_CONFIGS } from './PrivacySelector';

export class PrivacyIndicator {
  private container: HTMLElement;
  private level: PrivacyLevel;
  private compact: boolean;

  constructor(container: HTMLElement, level: PrivacyLevel, compact: boolean = false) {
    this.container = container;
    this.level = level;
    this.compact = compact;
    this.render();
  }

  setLevel(level: PrivacyLevel): void {
    this.level = level;
    this.render();
  }

  private render(): void {
    const config = PRIVACY_CONFIGS[this.level];

    if (this.compact) {
      this.container.innerHTML = `
        <span 
          class="privacy-badge" 
          style="background: ${config.color}; color: white;"
          title="${config.label}: ${config.description}"
        >
          ${config.icon}
        </span>
      `;
    } else {
      this.container.innerHTML = `
        <div class="privacy-indicator" style="border-color: ${config.color};">
          <span class="privacy-icon">${config.icon}</span>
          <span class="privacy-text" style="color: ${config.color};">${config.label}</span>
        </div>
      `;
    }
  }
}

export const PRIVACY_INDICATOR_CSS = `
.privacy-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: help;
}

.privacy-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  background: #2d2d2d;
  border: 1px solid;
  border-radius: 6px;
  font-size: 0.875rem;
}

.privacy-indicator .privacy-icon {
  font-size: 1rem;
}

.privacy-indicator .privacy-text {
  font-weight: 500;
}
`;
