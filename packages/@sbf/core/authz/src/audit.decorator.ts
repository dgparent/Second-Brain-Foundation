// Guardian Action Audit Decorator
// Automatically logs guardian actions for pseudo-personal tenants

import * as fs from 'fs/promises';
import * as path from 'path';

export interface AuditLogEntry {
  timestamp: string;
  tenant_id: string;
  user_id: string;
  user_role: string;
  action: string;
  entity_type?: string;
  entity_uid?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Decorator to audit guardian actions in pseudo-personal tenants
 */
export function AuditGuardianAction(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Find tenant context from arguments
      const tenantContext = args.find(arg => arg && arg.tenant_id && arg.user_roles);
      
      // Execute original method first
      const result = await originalMethod.apply(this, args);
      
      // If this is a guardian action in a pseudo-personal tenant, log it
      if (tenantContext && 
          tenantContext.tenant_type === 'pseudo_personal' && 
          tenantContext.user_roles.includes('guardian')) {
        
        const logEntry: AuditLogEntry = {
          timestamp: new Date().toISOString(),
          tenant_id: tenantContext.tenant_id,
          user_id: tenantContext.user_id,
          user_role: 'guardian',
          action,
          entity_type: result?.type || args[1]?.type,
          entity_uid: result?.uid || args[1]?.uid,
          metadata: {
            method: propertyKey,
            tenant_type: tenantContext.tenant_type
          }
        };
        
        await logGuardianAction(logEntry);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Write guardian action to audit log
 */
async function logGuardianAction(entry: AuditLogEntry): Promise<void> {
  const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
  const logPath = path.join(
    vaultsBasePath, 
    entry.tenant_id, 
    '.aei', 
    'audit-logs', 
    'guardian-actions.jsonl'
  );
  
  try {
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
  } catch (error) {
    // Create directory if it doesn't exist
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
  }
}

/**
 * General audit decorator for all tenant types
 */
export function AuditAction(action: string, requiresRole?: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const tenantContext = args.find(arg => arg && arg.tenant_id);
      
      const result = await originalMethod.apply(this, args);
      
      if (tenantContext) {
        // Check if action should be audited based on role
        if (!requiresRole || 
            requiresRole.some(role => tenantContext.user_roles?.includes(role))) {
          
          const logEntry: AuditLogEntry = {
            timestamp: new Date().toISOString(),
            tenant_id: tenantContext.tenant_id,
            user_id: tenantContext.user_id,
            user_role: tenantContext.user_roles?.[0] || 'unknown',
            action,
            entity_type: result?.type || args[1]?.type,
            entity_uid: result?.uid || args[1]?.uid,
            metadata: {
              method: propertyKey,
              tenant_type: tenantContext.tenant_type
            }
          };
          
          await logAuditEntry(logEntry);
        }
      }
      
      return result;
    };
    
    return descriptor;
  };
}

/**
 * Write audit entry to log
 */
async function logAuditEntry(entry: AuditLogEntry): Promise<void> {
  const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
  const logPath = path.join(
    vaultsBasePath, 
    entry.tenant_id, 
    '.aei', 
    'audit-logs', 
    'actions.jsonl'
  );
  
  try {
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
  } catch (error) {
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n');
  }
}

/**
 * Read audit logs for a tenant
 */
export async function readAuditLogs(
  tenantId: string,
  logType: 'guardian-actions' | 'actions' = 'actions',
  limit?: number
): Promise<AuditLogEntry[]> {
  const vaultsBasePath = process.env.VAULTS_BASE_PATH || './vaults';
  const logPath = path.join(
    vaultsBasePath, 
    tenantId, 
    '.aei', 
    'audit-logs', 
    `${logType}.jsonl`
  );
  
  try {
    const content = await fs.readFile(logPath, 'utf-8');
    const lines = content.trim().split('\n');
    const entries = lines.map(line => JSON.parse(line) as AuditLogEntry);
    
    if (limit) {
      return entries.slice(-limit);
    }
    
    return entries;
  } catch (error) {
    return [];
  }
}

/**
 * Get audit log statistics
 */
export async function getAuditStats(tenantId: string): Promise<{
  total_actions: number;
  guardian_actions: number;
  users: Set<string>;
  action_types: Record<string, number>;
  recent_activity: AuditLogEntry[];
}> {
  const allActions = await readAuditLogs(tenantId, 'actions');
  const guardianActions = await readAuditLogs(tenantId, 'guardian-actions');
  
  const users = new Set<string>();
  const actionTypes: Record<string, number> = {};
  
  for (const entry of allActions) {
    users.add(entry.user_id);
    actionTypes[entry.action] = (actionTypes[entry.action] || 0) + 1;
  }
  
  return {
    total_actions: allActions.length,
    guardian_actions: guardianActions.length,
    users,
    action_types: actionTypes,
    recent_activity: allActions.slice(-10)
  };
}
