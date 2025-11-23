/**
 * Lifecycle Components
 * UI components for managing entity lifecycle automation
 */

import { LIFECYCLE_DASHBOARD_CSS } from './LifecycleDashboard';
import { DISSOLUTION_QUEUE_CSS } from './DissolutionQueue';
import { NOTIFICATION_CENTER_CSS } from './NotificationCenter';

export { LifecycleDashboard } from './LifecycleDashboard';
export { DissolutionQueue } from './DissolutionQueue';
export { NotificationCenter } from './NotificationCenter';

export { LIFECYCLE_DASHBOARD_CSS, DISSOLUTION_QUEUE_CSS, NOTIFICATION_CENTER_CSS };

// Combined CSS for all lifecycle components
export const LIFECYCLE_CSS = `
${LIFECYCLE_DASHBOARD_CSS}
${DISSOLUTION_QUEUE_CSS}
${NOTIFICATION_CENTER_CSS}

/* Shared lifecycle component styles */
.lifecycle-container {
  min-height: 100vh;
  background: #1a1a1a;
}

.lifecycle-section {
  margin-bottom: 2rem;
}

.lifecycle-divider {
  height: 1px;
  background: #444;
  margin: 2rem 0;
}
`;
