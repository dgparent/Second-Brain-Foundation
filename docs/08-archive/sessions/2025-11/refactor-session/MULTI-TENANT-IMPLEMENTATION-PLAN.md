# Multi-Tenant Implementation Plan
## Second Brain Foundation

**Created:** 2025-11-24  
**Status:** 🚧 Planning Phase  
**Priority:** 🔴 Critical

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Phase 1: Foundation](#phase-1-foundation)
3. [Phase 2: Core Implementation](#phase-2-core-implementation)
4. [Phase 3: Tenant Types](#phase-3-tenant-types)
5. [Phase 4: Security & Compliance](#phase-4-security--compliance)
6. [Phase 5: Testing & Validation](#phase-5-testing--validation)
7. [Implementation Timeline](#implementation-timeline)
8. [Risk Mitigation](#risk-mitigation)

---

## Overview

### Objective
Transform Second Brain Foundation from single-tenant to multi-tenant architecture supporting three tenant types: Personal, Pseudo-Personal, and Professional.

### Success Criteria
- ✅ Complete tenant isolation (zero cross-tenant data access)
- ✅ OWASP-compliant security implementation
- ✅ All three tenant types fully functional
- ✅ Migration path for existing users
- ✅ Performance: <100ms overhead per request
- ✅ 100% test coverage for tenant isolation

---

## Phase 1: Foundation (Week 1-2)

### 1.1 Database Schema Changes

**Priority:** 🔴 Critical  
**Owner:** Database Engineer  
**Duration:** 3 days

#### Tasks

**1.1.1 Create Core Tenant Tables**

```typescript
// packages/@sbf/core/entity-manager/src/schema/tenant.schema.ts

interface Tenant {
  id: string;                    // UUID
  type: 'personal' | 'pseudo_personal' | 'professional';
  slug: string;                  // Unique, human-readable
  display_name: string;
  created_at: Date;
  updated_at: Date;
  status: 'active' | 'pending_delete' | 'suspended';
  
  // Type-specific metadata
  subject_person_uid?: string;   // For pseudo_personal
  org_metadata?: {
    legal_name?: string;
    country?: string;
    industry?: string;
    size?: string;
  };
  
  // Configuration
  features: {
    sso_enabled: boolean;
    max_members: number;
    retention_days: number;
    enable_cross_workspace_search: boolean;
  };
  
  policies: {
    export_requires_two_guardians?: boolean;
    allow_subject_login?: boolean;
    audit_retention_days: number;
    min_password_length?: number;
    require_mfa?: boolean;
  };
}

interface TenantMembership {
  id: string;
  tenant_id: string;
  user_id: string;
  role: TenantRole;
  status: 'active' | 'invited' | 'suspended';
  invited_by?: string;
  joined_at?: Date;
  invited_at: Date;
  metadata?: Record<string, any>;
}

type TenantRole = 
  // Common
  | 'tenant_owner'
  | 'tenant_admin'
  | 'member'
  | 'viewer'
  // Pseudo-personal
  | 'subject'
  | 'guardian'
  | 'care_team'
  // Professional
  | 'billing_admin'
  | 'org_admin'
  | 'manager'
  | 'guest';

interface TenantAuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_uid?: string;
  metadata: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}
```

**1.1.2 Add tenant_id to All Existing Tables**

```sql
-- Migration: Add tenant_id column to all entity tables
ALTER TABLE entities ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE notes ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE people ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE projects ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE tasks ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE events ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE places ADD COLUMN tenant_id UUID NOT NULL;

-- Create indexes for tenant_id
CREATE INDEX idx_entities_tenant ON entities(tenant_id);
CREATE INDEX idx_notes_tenant ON notes(tenant_id);
CREATE INDEX idx_people_tenant ON people(tenant_id);
CREATE INDEX idx_projects_tenant ON projects(tenant_id);
CREATE INDEX idx_tasks_tenant ON tasks(tenant_id);
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_places_tenant ON places(tenant_id);
```

**1.1.3 Implement Row-Level Security (RLS)**

```sql
-- Enable RLS on all entity tables
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Note: These policies assume current_tenant_id is set via SET LOCAL
CREATE POLICY tenant_isolation_policy ON entities
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

CREATE POLICY tenant_isolation_policy ON notes
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Repeat for all entity tables...

-- Policy for tenant membership queries
CREATE POLICY tenant_membership_policy ON tenant_memberships
  FOR ALL
  USING (
    user_id = current_setting('app.current_user_id')::uuid
    OR tenant_id IN (
      SELECT tenant_id FROM tenant_memberships 
      WHERE user_id = current_setting('app.current_user_id')::uuid
      AND status = 'active'
    )
  );
```

---

### 1.2 Tenant Context Management

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 2 days

#### Tasks

**1.2.1 Create TenantContext Service**

```typescript
// packages/@sbf/core/entity-manager/src/services/TenantContext.ts

export interface TenantContext {
  tenant_id: string;
  tenant_type: 'personal' | 'pseudo_personal' | 'professional';
  user_id: string;
  user_roles: TenantRole[];
  attributes: Record<string, any>;
  
  // Computed helpers
  isOwner(): boolean;
  isAdmin(): boolean;
  isGuardian(): boolean;
  hasRole(role: TenantRole): boolean;
  canPerform(action: string, resource?: any): boolean;
}

export class TenantContextService {
  /**
   * Resolve tenant context from auth session
   */
  async resolve(
    userId: string,
    tenantId: string
  ): Promise<TenantContext> {
    // 1. Verify user has membership in tenant
    const membership = await this.membershipRepo.findOne({
      user_id: userId,
      tenant_id: tenantId,
      status: 'active'
    });
    
    if (!membership) {
      throw new ForbiddenException('User not member of tenant');
    }
    
    // 2. Load tenant
    const tenant = await this.tenantRepo.findOne(tenantId);
    if (!tenant || tenant.status !== 'active') {
      throw new NotFoundException('Tenant not found or inactive');
    }
    
    // 3. Build context
    return {
      tenant_id: tenantId,
      tenant_type: tenant.type,
      user_id: userId,
      user_roles: [membership.role],
      attributes: {
        tenant_slug: tenant.slug,
        ...membership.metadata
      },
      
      isOwner: () => membership.role === 'tenant_owner',
      isAdmin: () => ['tenant_owner', 'tenant_admin', 'org_admin'].includes(membership.role),
      isGuardian: () => membership.role === 'guardian',
      hasRole: (role) => membership.role === role,
      canPerform: (action, resource) => {
        return this.authzService.check(membership.role, action, resource, tenant.type);
      }
    };
  }
  
  /**
   * Set tenant context for database session
   */
  async setDatabaseContext(tenantId: string, userId: string): Promise<void> {
    await this.db.query(`
      SET LOCAL app.current_tenant_id = '${tenantId}';
      SET LOCAL app.current_user_id = '${userId}';
    `);
  }
}
```

**1.2.2 Create Tenant Context Middleware**

```typescript
// packages/@sbf/api/src/middleware/tenant-context.middleware.ts

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private tenantContextService: TenantContextService
  ) {}
  
  async use(req: Request, res: Response, next: NextFunction) {
    // Extract tenant_id from:
    // 1. Header: X-Tenant-Id
    // 2. Subdomain: <tenant>.sbf.app
    // 3. Query param: ?tenant_id=xxx (dev only)
    
    const tenantId = this.extractTenantId(req);
    if (!tenantId) {
      throw new BadRequestException('Missing tenant context');
    }
    
    // Get authenticated user
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('Not authenticated');
    }
    
    // Resolve and attach context
    const context = await this.tenantContextService.resolve(userId, tenantId);
    req.tenantContext = context;
    
    // Set DB context for RLS
    await this.tenantContextService.setDatabaseContext(tenantId, userId);
    
    next();
  }
  
  private extractTenantId(req: Request): string | null {
    // Try header first
    if (req.headers['x-tenant-id']) {
      return req.headers['x-tenant-id'] as string;
    }
    
    // Try subdomain
    const host = req.headers.host;
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain !== 'www' && subdomain !== 'app') {
        return this.resolveTenantBySlug(subdomain);
      }
    }
    
    // Try query param (dev/testing only)
    if (process.env.NODE_ENV !== 'production' && req.query.tenant_id) {
      return req.query.tenant_id as string;
    }
    
    return null;
  }
}
```

---

### 1.3 Filesystem Isolation

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 2 days

#### Tasks

**1.3.1 Vault Directory Structure**

```typescript
// packages/@sbf/core/entity-manager/src/services/VaultFileSystem.ts

export class VaultFileSystem {
  private readonly baseVaultsPath = process.env.VAULTS_BASE_PATH || './vaults';
  
  /**
   * Get tenant vault root path
   */
  getTenantRoot(tenantId: string): string {
    // Validate tenant_id format (prevent path traversal)
    if (!/^[a-f0-9-]{36}$/.test(tenantId)) {
      throw new Error('Invalid tenant_id format');
    }
    
    return path.join(this.baseVaultsPath, tenantId);
  }
  
  /**
   * Validate path is within tenant boundary
   */
  validateTenantPath(tenantId: string, filePath: string): string {
    const tenantRoot = this.getTenantRoot(tenantId);
    const absolutePath = path.resolve(tenantRoot, filePath);
    
    // Ensure resolved path is within tenant root
    if (!absolutePath.startsWith(tenantRoot)) {
      throw new Error('Path traversal attempt detected');
    }
    
    return absolutePath;
  }
  
  /**
   * Initialize vault structure for new tenant
   */
  async initializeTenantVault(tenantId: string, tenantType: string): Promise<void> {
    const root = this.getTenantRoot(tenantId);
    
    // Create standard SBF folder structure
    const folders = [
      'Daily',
      'People',
      'Places',
      'Projects',
      'Topics',
      'Events',
      'Assets',
      'Templates',
      '.aei',
      '.aei/cache',
      '.aei/logs'
    ];
    
    // Add type-specific folders
    if (tenantType === 'pseudo_personal') {
      folders.push('Provenance', 'Guardian-Notes');
    } else if (tenantType === 'professional') {
      folders.push('Teams', 'Clients', 'Billing');
    }
    
    for (const folder of folders) {
      await fs.promises.mkdir(path.join(root, folder), { recursive: true });
    }
    
    // Create initial README
    await this.createInitialReadme(tenantId, tenantType);
    
    // Create first daily note
    await this.createWelcomeNote(tenantId, tenantType);
  }
  
  private async createInitialReadme(tenantId: string, tenantType: string): Promise<void> {
    const content = `# Welcome to Your Second Brain

This is your ${tenantType} vault managed by Second Brain Foundation.

## Getting Started

- Check the Daily/ folder for your daily notes
- Explore People/, Places/, Projects/, Topics/ for organized knowledge
- Use AEI (AI-Enabled Interface) for intelligent assistance

---

Created: ${new Date().toISOString()}
Tenant ID: ${tenantId}
Tenant Type: ${tenantType}
`;
    
    await fs.promises.writeFile(
      path.join(this.getTenantRoot(tenantId), 'README.md'),
      content
    );
  }
}
```

**1.3.2 File Watcher Per Tenant**

```typescript
// packages/@sbf/aei/src/services/TenantFileWatcher.ts

export class TenantFileWatcher {
  private watchers = new Map<string, FSWatcher>();
  
  /**
   * Start watching a tenant's vault
   */
  async watchTenant(tenantId: string): Promise<void> {
    if (this.watchers.has(tenantId)) {
      return; // Already watching
    }
    
    const vaultRoot = this.vaultFS.getTenantRoot(tenantId);
    
    const watcher = chokidar.watch(vaultRoot, {
      ignored: /(^|[\/\\])\../, // Ignore dotfiles except .aei
      persistent: true,
      ignoreInitial: true
    });
    
    watcher
      .on('add', (path) => this.handleFileAdded(tenantId, path))
      .on('change', (path) => this.handleFileChanged(tenantId, path))
      .on('unlink', (path) => this.handleFileDeleted(tenantId, path));
    
    this.watchers.set(tenantId, watcher);
  }
  
  /**
   * Stop watching a tenant's vault
   */
  async unwatchTenant(tenantId: string): Promise<void> {
    const watcher = this.watchers.get(tenantId);
    if (watcher) {
      await watcher.close();
      this.watchers.delete(tenantId);
    }
  }
  
  private async handleFileAdded(tenantId: string, filePath: string): Promise<void> {
    // Emit event to AEI processing queue with tenant context
    await this.aeiQueue.add('process-file', {
      tenant_id: tenantId,
      file_path: filePath,
      action: 'added'
    });
  }
}
```

---

### 1.4 Vector DB Tenant Isolation

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 2 days

#### Tasks

**1.4.1 Per-Tenant Collections**

```typescript
// packages/@sbf/memory-engine/src/services/TenantVectorStore.ts

export class TenantVectorStore {
  /**
   * Get collection name for tenant
   */
  private getCollectionName(tenantId: string, type: string): string {
    return `${type}_${tenantId}`;
  }
  
  /**
   * Initialize vector collections for new tenant
   */
  async initializeTenantCollections(tenantId: string): Promise<void> {
    const collections = [
      'entities',
      'notes',
      'daily',
      'embeddings'
    ];
    
    for (const type of collections) {
      const collectionName = this.getCollectionName(tenantId, type);
      
      await this.vectorDB.createCollection({
        name: collectionName,
        dimension: 1536, // OpenAI embedding dimension
        metric: 'cosine'
      });
    }
  }
  
  /**
   * Query within tenant boundary only
   */
  async query(
    tenantId: string,
    type: string,
    vector: number[],
    limit: number = 10
  ): Promise<any[]> {
    const collectionName = this.getCollectionName(tenantId, type);
    
    const results = await this.vectorDB.query({
      collection: collectionName,
      vector,
      limit
    });
    
    // Double-check tenant_id in metadata (defense in depth)
    return results.filter(r => r.metadata.tenant_id === tenantId);
  }
  
  /**
   * Delete all collections for tenant (offboarding)
   */
  async deleteTenantCollections(tenantId: string): Promise<void> {
    const collections = await this.vectorDB.listCollections();
    
    for (const collection of collections) {
      if (collection.name.endsWith(`_${tenantId}`)) {
        await this.vectorDB.deleteCollection(collection.name);
      }
    }
  }
}
```

---

### 1.5 Knowledge Graph Tenant Isolation

**Priority:** 🔴 Critical  
**Owner:** Database Engineer  
**Duration:** 2 days

#### Tasks

**1.5.1 Add tenant_id to Graph Nodes**

```typescript
// packages/@sbf/core/knowledge-graph/src/services/TenantGraph.ts

export class TenantGraph {
  /**
   * Create node with tenant context
   */
  async createNode(
    tenantId: string,
    nodeData: Partial<GraphNode>
  ): Promise<GraphNode> {
    // Always inject tenant_id
    const node = await this.graphDB.createNode({
      ...nodeData,
      tenant_id: tenantId,
      created_at: new Date()
    });
    
    return node;
  }
  
  /**
   * Query graph within tenant boundary
   */
  async query(
    tenantId: string,
    cypherQuery: string,
    params: Record<string, any> = {}
  ): Promise<any> {
    // Inject tenant filter into all queries
    const tenantFilteredQuery = `
      MATCH (n)
      WHERE n.tenant_id = $tenant_id
      WITH n
      ${cypherQuery}
    `;
    
    return this.graphDB.query(tenantFilteredQuery, {
      ...params,
      tenant_id: tenantId
    });
  }
  
  /**
   * Get entity relationships within tenant
   */
  async getEntityRelationships(
    tenantId: string,
    entityUid: string,
    depth: number = 2
  ): Promise<any> {
    const query = `
      MATCH (n {uid: $entityUid, tenant_id: $tenant_id})
      MATCH path = (n)-[*1..${depth}]-(related)
      WHERE related.tenant_id = $tenant_id
      RETURN path
    `;
    
    return this.graphDB.query(query, {
      entityUid,
      tenant_id: tenantId
    });
  }
}
```

---

## Phase 2: Core Implementation (Week 3-4)

### 2.1 Tenant Management API

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 4 days

#### Tasks

**2.1.1 Tenant CRUD Operations**

```typescript
// packages/@sbf/api/src/controllers/tenants.controller.ts

@Controller('api/v1/tenants')
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(
    private tenantService: TenantService,
    private tenantContextService: TenantContextService
  ) {}
  
  @Post()
  async createTenant(
    @Body() dto: CreateTenantDto,
    @User() user: UserEntity
  ): Promise<TenantResponse> {
    // Create tenant
    const tenant = await this.tenantService.create({
      type: dto.type,
      display_name: dto.display_name,
      features: dto.features || {},
      policies: dto.policies || {}
    });
    
    // Add creator as owner
    await this.tenantService.addMembership(tenant.id, {
      user_id: user.id,
      role: 'tenant_owner',
      status: 'active'
    });
    
    // Initialize vault filesystem
    await this.vaultFS.initializeTenantVault(tenant.id, tenant.type);
    
    // Initialize vector collections
    await this.vectorStore.initializeTenantCollections(tenant.id);
    
    // Start file watcher
    await this.fileWatcher.watchTenant(tenant.id);
    
    return this.mapToResponse(tenant);
  }
  
  @Get(':tenantId')
  @UseTenantContext()
  async getTenant(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: TenantContext
  ): Promise<TenantResponse> {
    // Context middleware already verified access
    const tenant = await this.tenantService.findOne(tenantId);
    return this.mapToResponse(tenant);
  }
  
  @Patch(':tenantId')
  @UseTenantContext()
  async updateTenant(
    @Param('tenantId') tenantId: string,
    @Body() dto: UpdateTenantDto,
    @TenantCtx() ctx: TenantContext
  ): Promise<TenantResponse> {
    // Require admin role
    if (!ctx.isAdmin()) {
      throw new ForbiddenException('Requires admin role');
    }
    
    const tenant = await this.tenantService.update(tenantId, dto);
    return this.mapToResponse(tenant);
  }
  
  @Delete(':tenantId')
  @UseTenantContext()
  async deleteTenant(
    @Param('tenantId') tenantId: string,
    @TenantCtx() ctx: TenantContext
  ): Promise<void> {
    // Require owner role
    if (!ctx.isOwner()) {
      throw new ForbiddenException('Only tenant owner can delete');
    }
    
    // Mark for deletion (soft delete)
    await this.tenantService.markForDeletion(tenantId);
    
    // Schedule cleanup job (after retention period)
    await this.cleanupQueue.add('delete-tenant', {
      tenant_id: tenantId,
      scheduled_for: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }
}
```

**2.1.2 Tenant Membership Management**

```typescript
// packages/@sbf/api/src/controllers/tenant-members.controller.ts

@Controller('api/v1/tenants/:tenantId/members')
@UseGuards(AuthGuard)
@UseTenantContext()
export class TenantMembersController {
  @Post('invite')
  async inviteMember(
    @Param('tenantId') tenantId: string,
    @Body() dto: InviteMemberDto,
    @TenantCtx() ctx: TenantContext
  ): Promise<MembershipResponse> {
    // Require admin
    if (!ctx.isAdmin()) {
      throw new ForbiddenException('Requires admin role');
    }
    
    // Create invitation
    const membership = await this.tenantService.createInvitation(tenantId, {
      email: dto.email,
      role: dto.role,
      invited_by: ctx.user_id
    });
    
    // Send invitation email
    await this.emailService.sendInvitation({
      to: dto.email,
      tenant_name: ctx.attributes.tenant_slug,
      invite_link: `${process.env.APP_URL}/accept-invite/${membership.id}`
    });
    
    return this.mapToResponse(membership);
  }
  
  @Post('accept/:inviteId')
  async acceptInvitation(
    @Param('inviteId') inviteId: string,
    @User() user: UserEntity
  ): Promise<MembershipResponse> {
    const membership = await this.tenantService.acceptInvitation(
      inviteId,
      user.id
    );
    
    return this.mapToResponse(membership);
  }
  
  @Delete(':userId')
  async removeMember(
    @Param('tenantId') tenantId: string,
    @Param('userId') userId: string,
    @TenantCtx() ctx: TenantContext
  ): Promise<void> {
    // Require admin or self-removal
    if (!ctx.isAdmin() && ctx.user_id !== userId) {
      throw new ForbiddenException('Requires admin role');
    }
    
    // Cannot remove last owner
    if (await this.tenantService.isLastOwner(tenantId, userId)) {
      throw new BadRequestException('Cannot remove last owner');
    }
    
    await this.tenantService.removeMembership(tenantId, userId);
  }
}
```

---

### 2.2 Update All Entity APIs

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 5 days

#### Tasks

**2.2.1 Inject Tenant Context into All Operations**

All existing entity APIs need updating:

```typescript
// BEFORE (single-tenant):
@Get()
async listEntities(): Promise<Entity[]> {
  return this.entityService.findAll();
}

// AFTER (multi-tenant):
@Get()
@UseTenantContext()
async listEntities(@TenantCtx() ctx: TenantContext): Promise<Entity[]> {
  return this.entityService.findAll(ctx.tenant_id);
}
```

**Files to Update:**
- `packages/@sbf/api/src/controllers/entities.controller.ts`
- `packages/@sbf/api/src/controllers/daily.controller.ts`
- `packages/@sbf/api/src/controllers/people.controller.ts`
- `packages/@sbf/api/src/controllers/projects.controller.ts`
- `packages/@sbf/api/src/controllers/tasks.controller.ts`
- `packages/@sbf/api/src/controllers/places.controller.ts`
- `packages/@sbf/api/src/controllers/events.controller.ts`

**2.2.2 Update Repository Layer**

```typescript
// packages/@sbf/core/entity-manager/src/repositories/base.repository.ts

export abstract class BaseTenantRepository<T> {
  protected abstract tableName: string;
  
  /**
   * All queries must include tenant_id filter
   */
  async findAll(tenantId: string, filter?: any): Promise<T[]> {
    return this.db(this.tableName)
      .where({ tenant_id: tenantId, ...filter });
  }
  
  async findOne(tenantId: string, id: string): Promise<T | null> {
    const result = await this.db(this.tableName)
      .where({ tenant_id: tenantId, id })
      .first();
    
    return result || null;
  }
  
  async create(tenantId: string, data: Partial<T>): Promise<T> {
    // Always inject tenant_id
    const [created] = await this.db(this.tableName)
      .insert({ ...data, tenant_id: tenantId })
      .returning('*');
    
    return created;
  }
  
  async update(tenantId: string, id: string, data: Partial<T>): Promise<T> {
    const [updated] = await this.db(this.tableName)
      .where({ tenant_id: tenantId, id })
      .update(data)
      .returning('*');
    
    if (!updated) {
      throw new NotFoundException('Entity not found in tenant');
    }
    
    return updated;
  }
  
  async delete(tenantId: string, id: string): Promise<void> {
    const deleted = await this.db(this.tableName)
      .where({ tenant_id: tenantId, id })
      .delete();
    
    if (deleted === 0) {
      throw new NotFoundException('Entity not found in tenant');
    }
  }
}
```

---

## Phase 3: Tenant Types (Week 5-6)

### 3.1 Personal Tenant

**Priority:** 🟡 High  
**Owner:** Backend Developer  
**Duration:** 2 days

#### Tasks

**3.1.1 Personal Tenant Creation Flow**

```typescript
// packages/@sbf/api/src/services/personal-tenant.service.ts

@Injectable()
export class PersonalTenantService {
  /**
   * Create default personal tenant for new user
   */
  async createDefaultPersonalTenant(userId: string): Promise<Tenant> {
    const tenant = await this.tenantService.create({
      type: 'personal',
      display_name: 'My Vault',
      slug: `user-${userId.substring(0, 8)}`,
      features: {
        sso_enabled: false,
        max_members: 1,
        retention_days: 365,
        enable_cross_workspace_search: false
      },
      policies: {
        audit_retention_days: 90
      }
    });
    
    // Add user as owner
    await this.tenantService.addMembership(tenant.id, {
      user_id: userId,
      role: 'tenant_owner',
      status: 'active'
    });
    
    // Initialize vault
    await this.vaultFS.initializeTenantVault(tenant.id, 'personal');
    await this.vectorStore.initializeTenantCollections(tenant.id);
    await this.fileWatcher.watchTenant(tenant.id);
    
    // Set default privacy settings
    await this.setDefaultPrivacySettings(tenant.id);
    
    return tenant;
  }
  
  private async setDefaultPrivacySettings(tenantId: string): Promise<void> {
    // Create default privacy configuration
    const privacyConfig = {
      default_sensitivity: 'personal',
      privacy: {
        local_ai_allowed: true,
        cloud_ai_allowed: false,
        export_allowed: true
      }
    };
    
    // Store in tenant vault
    await fs.promises.writeFile(
      path.join(
        this.vaultFS.getTenantRoot(tenantId),
        '.aei/privacy-config.json'
      ),
      JSON.stringify(privacyConfig, null, 2)
    );
  }
}
```

---

### 3.2 Pseudo-Personal Tenant

**Priority:** 🟡 High  
**Owner:** Backend Developer  
**Duration:** 3 days

#### Tasks

**3.2.1 Subject and Guardian Management**

```typescript
// packages/@sbf/api/src/services/pseudo-personal-tenant.service.ts

@Injectable()
export class PseudoPersonalTenantService {
  /**
   * Create pseudo-personal tenant with subject and guardians
   */
  async createPseudoPersonalTenant(
    guardianUserId: string,
    dto: CreatePseudoPersonalTenantDto
  ): Promise<Tenant> {
    const tenant = await this.tenantService.create({
      type: 'pseudo_personal',
      display_name: dto.display_name,
      slug: dto.slug,
      subject_person_uid: dto.subject_person_uid,
      features: {
        sso_enabled: false,
        max_members: 10, // Guardians + care team
        retention_days: 2555, // 7 years (legal requirement in some jurisdictions)
        enable_cross_workspace_search: false
      },
      policies: {
        export_requires_two_guardians: dto.require_two_guardian_approval || false,
        allow_subject_login: dto.allow_subject_login || false,
        audit_retention_days: 2555 // 7 years
      }
    });
    
    // Add creating user as first guardian
    await this.tenantService.addMembership(tenant.id, {
      user_id: guardianUserId,
      role: 'guardian',
      status: 'active'
    });
    
    // Initialize vault
    await this.vaultFS.initializeTenantVault(tenant.id, 'pseudo_personal');
    await this.vectorStore.initializeTenantCollections(tenant.id);
    await this.fileWatcher.watchTenant(tenant.id);
    
    // Create subject entity
    await this.createSubjectEntity(tenant.id, dto.subject_data);
    
    // Create provenance note documenting guardian authority
    await this.createProvenanceNote(tenant.id, guardianUserId, dto.authority_basis);
    
    return tenant;
  }
  
  private async createSubjectEntity(
    tenantId: string,
    subjectData: SubjectData
  ): Promise<void> {
    const personEntity = {
      uid: `person-subject-${Date.now()}`,
      type: 'person',
      title: subjectData.name,
      sensitivity: 'confidential',
      privacy: {
        local_ai_allowed: true,
        cloud_ai_allowed: false,
        export_allowed: false
      },
      metadata: {
        is_subject: true,
        date_of_birth: subjectData.date_of_birth,
        relationship: 'self'
      }
    };
    
    const content = `# ${subjectData.name}

**Role:** Subject of this pseudo-personal vault  
**Date of Birth:** ${subjectData.date_of_birth}  
**Guardians:** See Provenance/ folder for authority documentation

## Notes

This vault is managed by appointed guardians on behalf of ${subjectData.name}.
`;
    
    await this.entityService.create(tenantId, personEntity, content);
  }
  
  private async createProvenanceNote(
    tenantId: string,
    guardianUserId: string,
    authorityBasis: string
  ): Promise<void> {
    const content = `# Guardian Authority Provenance

**Date Established:** ${new Date().toISOString()}  
**Primary Guardian:** User ${guardianUserId}  
**Authority Basis:** ${authorityBasis}

## Consent and Authorization

${authorityBasis === 'parental' ? 
  'This vault is managed by a parent/legal guardian with inherent parental authority.' :
  'This vault is managed under delegated authority with documented consent.'}

## Audit Trail

All guardian actions are logged in \`.aei/audit-logs/\`

## Guardian Responsibilities

- Act in the best interest of the subject
- Maintain confidentiality and privacy
- Document significant decisions
- Comply with applicable laws and regulations
`;
    
    const vaultRoot = this.vaultFS.getTenantRoot(tenantId);
    await fs.promises.writeFile(
      path.join(vaultRoot, 'Provenance', `guardian-authority-${Date.now()}.md`),
      content
    );
  }
}
```

**3.2.2 Guardian Action Audit Logging**

```typescript
// packages/@sbf/core/entity-manager/src/decorators/audit-guardian-action.ts

export function AuditGuardianAction(action: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const tenantContext: TenantContext = args.find(arg => arg.tenant_id);
      
      if (tenantContext && tenantContext.isGuardian()) {
        // Log guardian action
        await this.auditLogService.log({
          tenant_id: tenantContext.tenant_id,
          user_id: tenantContext.user_id,
          action,
          entity_type: args[1]?.type,
          entity_uid: args[1]?.uid,
          metadata: {
            method: propertyKey,
            timestamp: new Date().toISOString()
          }
        });
      }
      
      return originalMethod.apply(this, args);
    };
    
    return descriptor;
  };
}

// Usage:
class EntityService {
  @AuditGuardianAction('delete_entity')
  async delete(tenantId: string, entityUid: string) {
    // Guardian deletion will be automatically logged
  }
}
```

---

### 3.3 Professional Tenant

**Priority:** 🟡 High  
**Owner:** Backend Developer  
**Duration:** 3 days

#### Tasks

**3.3.1 Organization Features**

```typescript
// packages/@sbf/api/src/services/professional-tenant.service.ts

@Injectable()
export class ProfessionalTenantService {
  /**
   * Create professional tenant for organization
   */
  async createProfessionalTenant(
    ownerUserId: string,
    dto: CreateProfessionalTenantDto
  ): Promise<Tenant> {
    const tenant = await this.tenantService.create({
      type: 'professional',
      display_name: dto.organization_name,
      slug: dto.slug,
      org_metadata: {
        legal_name: dto.legal_name,
        country: dto.country,
        industry: dto.industry,
        size: dto.size
      },
      features: {
        sso_enabled: dto.enable_sso || false,
        max_members: dto.max_members || 50,
        retention_days: dto.retention_days || 2555, // 7 years default
        enable_cross_workspace_search: true
      },
      policies: {
        audit_retention_days: 2555,
        min_password_length: 12,
        require_mfa: dto.require_mfa || false
      }
    });
    
    // Add creator as owner
    await this.tenantService.addMembership(tenant.id, {
      user_id: ownerUserId,
      role: 'tenant_owner',
      status: 'active'
    });
    
    // Initialize vault
    await this.vaultFS.initializeTenantVault(tenant.id, 'professional');
    await this.vectorStore.initializeTenantCollections(tenant.id);
    await this.fileWatcher.watchTenant(tenant.id);
    
    return tenant;
  }
  
  /**
   * Assign role with organizational hierarchy
   */
  async assignRole(
    tenantId: string,
    userId: string,
    role: TenantRole,
    metadata?: {
      department?: string;
      team?: string;
      manager_id?: string;
    }
  ): Promise<void> {
    await this.tenantService.updateMembership(tenantId, userId, {
      role,
      metadata
    });
  }
}
```

---

## Phase 4: Security & Compliance (Week 7)

### 4.1 OWASP Compliance Review

**Priority:** 🔴 Critical  
**Owner:** Security Specialist  
**Duration:** 3 days

#### Checklist

- [ ] **A01: Broken Access Control**
  - [ ] All API endpoints require tenant context
  - [ ] RLS policies enforced at database level
  - [ ] No direct object references without tenant check
  
- [ ] **A02: Cryptographic Failures**
  - [ ] Tenant IDs are UUIDs (not sequential)
  - [ ] Session tokens are tenant-scoped
  - [ ] Audit logs encrypted at rest
  
- [ ] **A03: Injection**
  - [ ] All tenant_id parameters validated
  - [ ] Path traversal prevention in file operations
  - [ ] SQL injection prevention via parameterized queries
  
- [ ] **A04: Insecure Design**
  - [ ] Threat model documented
  - [ ] Security requirements per tenant type
  - [ ] Defense in depth (RLS + app-level filtering)
  
- [ ] **A05: Security Misconfiguration**
  - [ ] RLS enabled on all tables
  - [ ] Default deny access policies
  - [ ] Regular security audits scheduled

---

### 4.2 Authorization Engine

**Priority:** 🔴 Critical  
**Owner:** Backend Developer  
**Duration:** 2 days

```typescript
// packages/@sbf/core/authz/src/services/authorization.service.ts

@Injectable()
export class AuthorizationService {
  /**
   * Check if user can perform action on resource
   */
  canPerform(
    role: TenantRole,
    action: string,
    resource: any,
    tenantType: string
  ): boolean {
    const policy = this.getPolicyForRole(role, tenantType);
    
    // Check RBAC rules
    if (!policy.actions.includes(action)) {
      return false;
    }
    
    // Check ABAC conditions
    if (resource?.sensitivity) {
      const maxSensitivity = this.getMaxSensitivity(role, tenantType);
      if (!this.canAccessSensitivity(resource.sensitivity, maxSensitivity)) {
        return false;
      }
    }
    
    return true;
  }
  
  private getPolicyForRole(role: TenantRole, tenantType: string): Policy {
    const policies = {
      // Personal tenant
      personal: {
        tenant_owner: {
          actions: ['*'], // Full control
          max_sensitivity: 'strictly_confidential'
        }
      },
      
      // Pseudo-personal tenant
      pseudo_personal: {
        guardian: {
          actions: [
            'read', 'create', 'update',
            // Note: 'delete' requires special approval
          ],
          max_sensitivity: 'confidential',
          conditions: {
            cannot_change_sensitivity: true,
            cannot_delete_subject_entity: true
          }
        },
        subject: {
          actions: ['read'],
          max_sensitivity: 'personal'
        }
      },
      
      // Professional tenant
      professional: {
        tenant_owner: {
          actions: ['*'],
          max_sensitivity: 'strictly_confidential'
        },
        org_admin: {
          actions: ['read', 'create', 'update', 'delete', 'manage_users'],
          max_sensitivity: 'confidential'
        },
        member: {
          actions: ['read', 'create', 'update'],
          max_sensitivity: 'internal'
        },
        viewer: {
          actions: ['read'],
          max_sensitivity: 'internal'
        },
        guest: {
          actions: ['read'],
          max_sensitivity: 'public'
        }
      }
    };
    
    return policies[tenantType]?.[role] || { actions: [], max_sensitivity: 'public' };
  }
  
  private canAccessSensitivity(
    resourceSensitivity: string,
    maxSensitivity: string
  ): boolean {
    const levels = [
      'public',
      'internal',
      'personal',
      'confidential',
      'strictly_confidential'
    ];
    
    const resourceLevel = levels.indexOf(resourceSensitivity);
    const maxLevel = levels.indexOf(maxSensitivity);
    
    return resourceLevel <= maxLevel;
  }
}
```

---

## Phase 5: Testing & Validation (Week 8)

### 5.1 Tenant Isolation Tests

**Priority:** 🔴 Critical  
**Owner:** QA Specialist  
**Duration:** 4 days

```typescript
// packages/@sbf/core/entity-manager/src/__tests__/tenant-isolation.spec.ts

describe('Tenant Isolation', () => {
  let tenant1: Tenant;
  let tenant2: Tenant;
  let user1: User;
  let user2: User;
  
  beforeEach(async () => {
    // Create two separate tenants
    tenant1 = await tenantService.create({ type: 'personal', display_name: 'Tenant 1' });
    tenant2 = await tenantService.create({ type: 'personal', display_name: 'Tenant 2' });
    
    user1 = await authService.register({ email: 'user1@test.com' });
    user2 = await authService.register({ email: 'user2@test.com' });
    
    await tenantService.addMembership(tenant1.id, { user_id: user1.id, role: 'tenant_owner' });
    await tenantService.addMembership(tenant2.id, { user_id: user2.id, role: 'tenant_owner' });
  });
  
  describe('Database Isolation', () => {
    it('should not allow cross-tenant entity access', async () => {
      // Create entity in tenant 1
      const entity = await entityService.create(tenant1.id, {
        uid: 'test-001',
        type: 'topic',
        title: 'Secret Data'
      });
      
      // Try to access from tenant 2 context
      await expect(
        entityService.findOne(tenant2.id, entity.uid)
      ).rejects.toThrow(NotFoundException);
    });
    
    it('should enforce RLS at database level', async () => {
      // Create entity in tenant 1
      await entityService.create(tenant1.id, {
        uid: 'test-002',
        type: 'topic',
        title: 'Tenant 1 Data'
      });
      
      // Set tenant 2 context
      await db.query(`SET LOCAL app.current_tenant_id = '${tenant2.id}'`);
      
      // Direct DB query should return empty (RLS enforcement)
      const results = await db('entities').where({ uid: 'test-002' });
      expect(results).toHaveLength(0);
    });
  });
  
  describe('Filesystem Isolation', () => {
    it('should not allow path traversal across tenants', async () => {
      const vaultFS = new VaultFileSystem();
      
      // Attempt to access tenant 2 files from tenant 1 context
      expect(() => {
        vaultFS.validateTenantPath(tenant1.id, `../../${tenant2.id}/Daily/2025-11-24.md`);
      }).toThrow('Path traversal attempt detected');
    });
    
    it('should maintain separate vault directories', async () => {
      const root1 = vaultFS.getTenantRoot(tenant1.id);
      const root2 = vaultFS.getTenantRoot(tenant2.id);
      
      expect(root1).not.toEqual(root2);
      expect(root1).toContain(tenant1.id);
      expect(root2).toContain(tenant2.id);
    });
  });
  
  describe('Vector DB Isolation', () => {
    it('should use separate collections per tenant', async () => {
      // Add vector to tenant 1
      await vectorStore.upsert(tenant1.id, 'entities', {
        id: 'vec-001',
        vector: [0.1, 0.2, 0.3],
        metadata: { tenant_id: tenant1.id }
      });
      
      // Query from tenant 2 should not find it
      const results = await vectorStore.query(tenant2.id, 'entities', [0.1, 0.2, 0.3]);
      expect(results).toHaveLength(0);
    });
  });
  
  describe('API Isolation', () => {
    it('should reject requests without tenant context', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/entities')
        .set('Authorization', `Bearer ${user1.token}`)
        // Intentionally omit X-Tenant-Id header
        .expect(400);
      
      expect(response.body.message).toContain('Missing tenant context');
    });
    
    it('should reject access to non-member tenant', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/entities')
        .set('Authorization', `Bearer ${user1.token}`)
        .set('X-Tenant-Id', tenant2.id) // User 1 not member of tenant 2
        .expect(403);
      
      expect(response.body.message).toContain('not member of tenant');
    });
  });
});
```

---

## Implementation Timeline

### Overview

| Phase | Duration | Weeks | Status |
|-------|----------|-------|--------|
| Phase 1: Foundation | 10 days | 1-2 | 🔴 Not Started |
| Phase 2: Core Implementation | 9 days | 3-4 | 🔴 Not Started |
| Phase 3: Tenant Types | 8 days | 5-6 | 🔴 Not Started |
| Phase 4: Security & Compliance | 5 days | 7 | 🔴 Not Started |
| Phase 5: Testing & Validation | 4 days | 8 | 🔴 Not Started |
| **Total** | **36 working days** | **~8 weeks** | |

### Detailed Timeline

**Week 1-2: Foundation**
- Days 1-3: Database schema + RLS
- Days 4-5: Tenant context service
- Days 6-7: Filesystem isolation
- Days 8-9: Vector DB isolation
- Day 10: Knowledge graph isolation

**Week 3-4: Core Implementation**
- Days 11-14: Tenant management API
- Days 15-19: Update all entity APIs
- Day 20: Integration testing

**Week 5-6: Tenant Types**
- Days 21-22: Personal tenant
- Days 23-25: Pseudo-personal tenant
- Days 26-28: Professional tenant

**Week 7: Security & Compliance**
- Days 29-31: OWASP compliance review
- Days 32-33: Authorization engine

**Week 8: Testing & Validation**
- Days 34-36: Tenant isolation tests
- Day 37: Performance testing
- Day 38: Security audit
- Day 39: Documentation
- Day 40: Production readiness review

---

## Risk Mitigation

### Critical Risks

**1. Cross-Tenant Data Leakage**
- **Risk Level:** 🔴 Critical
- **Mitigation:**
  - Defense in depth: RLS + app-level filtering
  - Comprehensive isolation testing
  - Regular security audits
  - Code review checklist

**2. Performance Degradation**
- **Risk Level:** 🟡 Medium
- **Mitigation:**
  - Proper indexing on tenant_id
  - RLS query plan analysis
  - Caching strategies per tenant
  - Load testing with 1000+ tenants

**3. Migration Complexity**
- **Risk Level:** 🟡 Medium
- **Mitigation:**
  - Create migration scripts early
  - Test on copy of production data
  - Rollback plan
  - Staged migration (beta users first)

**4. Audit Log Storage Growth**
- **Risk Level:** 🟢 Low
- **Mitigation:**
  - Log rotation and archival
  - Configurable retention periods
  - Compression for old logs

---

## Migration Plan (Existing Users)

### For Current Single-Tenant Users

```typescript
// Migration script
async function migrateExistingUsers() {
  const users = await User.findAll();
  
  for (const user of users) {
    console.log(`Migrating user ${user.email}...`);
    
    // 1. Create personal tenant for user
    const tenant = await tenantService.create({
      type: 'personal',
      display_name: 'My Vault',
      slug: `user-${user.id.substring(0, 8)}`
    });
    
    // 2. Add user as owner
    await tenantService.addMembership(tenant.id, {
      user_id: user.id,
      role: 'tenant_owner',
      status: 'active'
    });
    
    // 3. Move existing vault data
    await moveVaultData(user.id, tenant.id);
    
    // 4. Update entity tenant_id references
    await updateEntityReferences(user.id, tenant.id);
    
    // 5. Migrate vector embeddings
    await migrateVectorEmbeddings(user.id, tenant.id);
    
    console.log(`✅ Migrated user ${user.email}`);
  }
}

async function moveVaultData(userId: string, tenantId: string) {
  const oldPath = `./vault`;
  const newPath = `./vaults/${tenantId}`;
  
  await fs.promises.rename(oldPath, newPath);
}

async function updateEntityReferences(userId: string, tenantId: string) {
  await db.transaction(async (trx) => {
    await trx('entities').update({ tenant_id: tenantId });
    await trx('notes').update({ tenant_id: tenantId });
    await trx('people').update({ tenant_id: tenantId });
    await trx('projects').update({ tenant_id: tenantId });
    await trx('tasks').update({ tenant_id: tenantId });
    await trx('events').update({ tenant_id: tenantId });
    await trx('places').update({ tenant_id: tenantId });
  });
}
```

---

## Success Metrics

### Technical Metrics
- ✅ 100% of API endpoints tenant-aware
- ✅ 0 cross-tenant data access in tests
- ✅ < 100ms overhead per request
- ✅ RLS coverage on all tables
- ✅ 100% test coverage for isolation

### Business Metrics
- ✅ Support 1000+ tenants
- ✅ < 2 second tenant creation
- ✅ 99.9% tenant isolation guarantee
- ✅ Zero security incidents

---

## Next Steps

**Immediate Actions:**
1. ✅ Review and approve this plan
2. ⏭️ Set up development branch: `feature/multi-tenant`
3. ⏭️ Begin Phase 1.1: Database schema changes
4. ⏭️ Schedule daily standup for progress tracking

**Questions for Decision:**
- Q1: Which database? (Recommend PostgreSQL for RLS)
- Q2: Deployment strategy? (Big bang vs gradual migration)
- Q3: Beta program for early testers?

---

**Document Status:** ✅ Ready for Review  
**Last Updated:** 2025-11-24  
**Next Review:** After Phase 1 completion
