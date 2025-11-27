export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'personal' | 'professional' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  createdAt: Date;
}
