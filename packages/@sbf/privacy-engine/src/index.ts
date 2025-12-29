/**
 * @sbf/privacy-engine
 *
 * Privacy and sensitivity management engine for Second Brain Foundation.
 * Implements PRD FR15-FR19 requirements for privacy-first knowledge management.
 *
 * Key Features:
 * - Tiered sensitivity levels (public, personal, confidential, secret)
 * - Context-based permissions for AI, export, sync, and sharing
 * - Sensitivity inheritance from parent entities
 * - Privacy audit logging
 * - AI access control middleware
 *
 * @packageDocumentation
 */

// Types
export * from './types';

// Constants
export * from './constants';

// Services
export {
  AuditLogger,
  InheritanceResolver,
  PermissionChecker,
  SensitivityService,
} from './services';
export type {
  AuditLogDatabase,
  AuditQueryOptions,
  AuditLogStats,
  InheritableEntity,
  EntityRelationship,
  InheritanceDatabase,
  PermissionType,
  SensitivityDatabase,
} from './services';

// Middleware
export { AIAccessControl, SensitivityFilter } from './middleware';
