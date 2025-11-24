/**
 * @sbf/modules-relationship-crm
 * 
 * CRM and Contact Management Plugin for Second Brain Foundation
 * 
 * Validates the Relationship Tracking Framework by providing
 * professional-grade CRM features with 85-90% code reuse.
 */

// Entities
export * from './entities';

// Common types (export once to avoid conflicts)
export type { SimpleMemoryEngine, SimpleAEIProvider, SimpleEntity } from './types/common';

// Workflows (excluding types to avoid re-export conflicts)
export { ContactCreationWorkflow, type ContactCreationOptions } from './workflows/ContactCreationWorkflow';
export { InteractionLoggingWorkflow, type InteractionLoggingOptions } from './workflows/InteractionLoggingWorkflow';
export { FollowUpReminderWorkflow, type ReminderOptions, type FollowUpReminder } from './workflows/FollowUpReminderWorkflow';

// Utilities
export * from './utils';

// Main CRM Service (convenience wrapper)
export { CRMService } from './CRMService';
