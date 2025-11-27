export function getTenantNamespace(tenantId: string): string {
  return `tenant_${tenantId}`;
}

export function getEntityVectorId(tenantId: string, entityId: string): string {
  return `${tenantId}:${entityId}`;
}

export function parseVectorId(vectorId: string): { tenantId: string; entityId: string } | null {
  const parts = vectorId.split(':');
  if (parts.length !== 2) {
    return null;
  }
  return {
    tenantId: parts[0],
    entityId: parts[1],
  };
}
