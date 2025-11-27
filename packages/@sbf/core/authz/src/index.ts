// Authorization Module
// Exports for RBAC + ABAC hybrid authorization system

export { AuthorizationService } from './authorization.service';
export type { TenantRole, TenantType, SensitivityLevel, Action } from './authorization.service';

export { 
  AuditGuardianAction, 
  AuditAction, 
  readAuditLogs, 
  getAuditStats 
} from './audit.decorator';
export type { AuditLogEntry } from './audit.decorator';
