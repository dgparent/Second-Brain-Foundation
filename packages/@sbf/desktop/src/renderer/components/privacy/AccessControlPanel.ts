/**
 * Access Control Panel Component
 * 
 * Manages roles, permissions, and access control for entities.
 */

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UserAccess {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  lastAccess: Date;
}

export interface AccessControlPanelOptions {
  onRoleChange?: (roleId: string, permissions: string[]) => void;
  onUserRoleChange?: (userId: string, roles: string[]) => void;
}

export class AccessControlPanel {
  private container: HTMLElement;
  private options: AccessControlPanelOptions;
  private roles: Role[] = [];
  private permissions: Permission[] = [];
  private users: UserAccess[] = [];
  private selectedRole: Role | null = null;
  private loading: boolean = true;
  private activeTab: 'roles' | 'users' | 'permissions' = 'roles';

  constructor(container: HTMLElement, options: AccessControlPanelOptions = {}) {
    this.container = container;
    this.options = options;
    this.initialize();
  }

  private async initialize() {
    await this.loadData();
    this.render();
  }

  private async loadData() {
    this.loading = true;
    this.render();

    try {
      const [roles, permissions, users] = await Promise.all([
        window.sbfAPI.accessControl.getRoles(),
        window.sbfAPI.accessControl.getPermissions(),
        window.sbfAPI.accessControl.getUsers(),
      ]);

      this.roles = roles.map((r: any) => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      }));

      this.permissions = permissions;
      
      this.users = users.map((u: any) => ({
        ...u,
        lastAccess: new Date(u.lastAccess),
      }));

      this.loading = false;
      this.render();
    } catch (error) {
      console.error('Failed to load access control data:', error);
      this.loading = false;
      this.render();
    }
  }

  private async saveRole(role: Role) {
    try {
      // TODO: Implement updateRole API
      this.options.onRoleChange?.(role.id, role.permissions);
      await this.loadData();
    } catch (error) {
      console.error('Failed to save role:', error);
      alert('Failed to save role. Please try again.');
    }
  }

  private async updateUserRoles(userId: string, roles: string[]) {
    try {
      // TODO: Implement updateUserRoles API
      this.options.onUserRoleChange?.(userId, roles);
      await this.loadData();
    } catch (error) {
      console.error('Failed to update user roles:', error);
      alert('Failed to update user roles. Please try again.');
    }
  }

  private render() {
    if (this.loading) {
      this.container.innerHTML = '<div class="access-control-loading">Loading...</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="access-control-panel">
        ${this.renderHeader()}
        ${this.renderTabs()}
        ${this.renderTabContent()}
      </div>
    `;

    this.attachEventListeners();
  }

  private renderHeader(): string {
    return `
      <div class="panel-header">
        <div>
          <h2>Access Control</h2>
          <p class="subtitle">Manage roles, permissions, and user access</p>
        </div>
        <button class="btn-refresh" data-action="refresh">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    `;
  }

  private renderTabs(): string {
    return `
      <div class="tabs">
        <button class="tab ${this.activeTab === 'roles' ? 'active' : ''}" data-tab="roles">
          Roles (${this.roles.length})
        </button>
        <button class="tab ${this.activeTab === 'users' ? 'active' : ''}" data-tab="users">
          Users (${this.users.length})
        </button>
        <button class="tab ${this.activeTab === 'permissions' ? 'active' : ''}" data-tab="permissions">
          Permissions (${this.permissions.length})
        </button>
      </div>
    `;
  }

  private renderTabContent(): string {
    switch (this.activeTab) {
      case 'roles':
        return this.renderRolesTab();
      case 'users':
        return this.renderUsersTab();
      case 'permissions':
        return this.renderPermissionsTab();
      default:
        return '';
    }
  }

  private renderRolesTab(): string {
    return `
      <div class="tab-content">
        <div class="roles-layout">
          <div class="roles-list">
            <div class="list-header">
              <h3>Roles</h3>
              <button class="btn-secondary btn-sm" data-action="add-role">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Role
              </button>
            </div>
            <div class="role-items">
              ${this.roles.map(role => this.renderRoleItem(role)).join('')}
            </div>
          </div>

          <div class="role-details">
            ${this.selectedRole ? this.renderRoleDetails(this.selectedRole) : this.renderNoSelection()}
          </div>
        </div>
      </div>
    `;
  }

  private renderRoleItem(role: Role): string {
    const isSelected = this.selectedRole?.id === role.id;
    
    return `
      <div class="role-item ${isSelected ? 'selected' : ''}" data-action="select-role" data-role-id="${role.id}">
        <div class="role-info">
          <h4>${role.name}</h4>
          <p>${role.description}</p>
        </div>
        <div class="role-meta">
          <span class="badge">${role.permissions.length} permissions</span>
          <span class="badge">${role.userCount} users</span>
        </div>
      </div>
    `;
  }

  private renderNoSelection(): string {
    return `
      <div class="no-selection">
        <svg class="icon-large" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <p>Select a role to view details</p>
      </div>
    `;
  }

  private renderRoleDetails(role: Role): string {
    const permissionsByCategory = this.permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    return `
      <div class="details-container">
        <div class="details-header">
          <h3>${role.name}</h3>
          <div class="details-actions">
            <button class="btn-secondary btn-sm" data-action="save-role">Save Changes</button>
            <button class="btn-danger btn-sm" data-action="delete-role" data-role-id="${role.id}">Delete</button>
          </div>
        </div>

        <div class="details-content">
          <div class="form-group">
            <label>Role Name</label>
            <input type="text" class="form-input" value="${role.name}" data-field="name" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea class="form-textarea" data-field="description">${role.description}</textarea>
          </div>

          <div class="form-group">
            <label>Permissions</label>
            <div class="permissions-grid">
              ${Object.entries(permissionsByCategory).map(([category, perms]) => `
                <div class="permission-category">
                  <h4>${category}</h4>
                  ${perms.map(perm => `
                    <label class="permission-checkbox">
                      <input 
                        type="checkbox" 
                        ${role.permissions.includes(perm.id) ? 'checked' : ''}
                        data-permission-id="${perm.id}"
                      />
                      <div>
                        <div class="permission-name">${perm.name}</div>
                        <div class="permission-description">${perm.description}</div>
                      </div>
                    </label>
                  `).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="details-meta">
            <p><strong>Created:</strong> ${role.createdAt.toLocaleDateString()}</p>
            <p><strong>Last Updated:</strong> ${role.updatedAt.toLocaleDateString()}</p>
            <p><strong>Users:</strong> ${role.userCount}</p>
          </div>
        </div>
      </div>
    `;
  }

  private renderUsersTab(): string {
    return `
      <div class="tab-content">
        <div class="users-table">
          <div class="table-header">
            <h3>Users</h3>
            <button class="btn-secondary btn-sm" data-action="add-user">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Add User
            </button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Last Access</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.users.map(user => this.renderUserRow(user)).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderUserRow(user: UserAccess): string {
    const roleNames = user.roles.map(roleId => {
      const role = this.roles.find(r => r.id === roleId);
      return role ? role.name : roleId;
    });

    return `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>
          <div class="role-badges">
            ${roleNames.map(name => `<span class="badge">${name}</span>`).join('')}
          </div>
        </td>
        <td>${this.formatTimeAgo(user.lastAccess)}</td>
        <td>
          <button class="btn-text" data-action="edit-user" data-user-id="${user.userId}">Edit</button>
        </td>
      </tr>
    `;
  }

  private renderPermissionsTab(): string {
    const permissionsByCategory = this.permissions.reduce((acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);

    return `
      <div class="tab-content">
        <div class="permissions-list">
          <h3>All Permissions</h3>
          ${Object.entries(permissionsByCategory).map(([category, perms]) => `
            <div class="permission-category-section">
              <h4>${category}</h4>
              <div class="permission-items">
                ${perms.map(perm => `
                  <div class="permission-card">
                    <h5>${perm.name}</h5>
                    <p>${perm.description}</p>
                    <div class="permission-usage">
                      Used in ${this.countRolesWithPermission(perm.id)} roles
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private countRolesWithPermission(permissionId: string): number {
    return this.roles.filter(role => role.permissions.includes(permissionId)).length;
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  private attachEventListeners() {
    // Refresh
    this.container.querySelector('[data-action="refresh"]')?.addEventListener('click', () => {
      this.loadData();
    });

    // Tab switching
    this.container.querySelectorAll('[data-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        this.activeTab = (tab as HTMLElement).dataset.tab as any;
        this.render();
      });
    });

    // Select role
    this.container.querySelectorAll('[data-action="select-role"]').forEach(item => {
      item.addEventListener('click', () => {
        const roleId = (item as HTMLElement).dataset.roleId!;
        this.selectedRole = this.roles.find(r => r.id === roleId) || null;
        this.render();
      });
    });

    // Save role
    this.container.querySelector('[data-action="save-role"]')?.addEventListener('click', () => {
      if (this.selectedRole) {
        // Collect updated data
        const nameInput = this.container.querySelector('[data-field="name"]') as HTMLInputElement;
        const descInput = this.container.querySelector('[data-field="description"]') as HTMLTextAreaElement;
        const permCheckboxes = this.container.querySelectorAll('[data-permission-id]') as NodeListOf<HTMLInputElement>;

        const updatedRole: Role = {
          ...this.selectedRole,
          name: nameInput.value,
          description: descInput.value,
          permissions: Array.from(permCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.permissionId!),
          updatedAt: new Date(),
        };

        this.saveRole(updatedRole);
      }
    });
  }

  public refresh() {
    this.loadData();
  }

  public destroy() {
    this.container.innerHTML = '';
  }
}

// CSS Styles
export const ACCESS_CONTROL_PANEL_CSS = `
.access-control-panel {
  padding: 1.5rem;
  background: #1a1a1a;
  min-height: 100vh;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.panel-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #e0e0e0;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #444;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: #999;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: -2px;
  transition: all 0.2s;
}

.tab:hover {
  color: #e0e0e0;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.roles-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1.5rem;
}

.roles-list,
.role-details {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #444;
}

.list-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-sm svg {
  width: 1rem;
  height: 1rem;
}

.role-items {
  max-height: 600px;
  overflow-y: auto;
}

.role-item {
  padding: 1rem;
  border-bottom: 1px solid #2d2d2d;
  cursor: pointer;
  transition: background 0.2s;
}

.role-item:hover {
  background: #242424;
}

.role-item.selected {
  background: #1e2a35;
  border-left: 3px solid #3b82f6;
}

.role-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
}

.role-info p {
  margin: 0;
  font-size: 0.75rem;
  color: #999;
}

.role-meta {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.badge {
  padding: 0.125rem 0.5rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 12px;
  font-size: 0.625rem;
  color: #999;
}

.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: #999;
}

.icon-large {
  width: 4rem;
  height: 4rem;
  margin-bottom: 1rem;
  color: #666;
}

.details-container {
  padding: 1.5rem;
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.details-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #e0e0e0;
}

.details-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-danger {
  background: #ef4444;
}

.btn-danger:hover {
  background: #dc2626;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e0e0e0;
}

.form-input,
.form-textarea {
  padding: 0.5rem 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  color: #e0e0e0;
  font-size: 0.875rem;
  font-family: inherit;
}

.form-textarea {
  min-height: 80px;
  resize: vertical;
}

.permissions-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.permission-category h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permission-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.permission-checkbox:hover {
  background: #242424;
}

.permission-checkbox input[type="checkbox"] {
  margin-top: 0.125rem;
}

.permission-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #e0e0e0;
}

.permission-description {
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.125rem;
}

.details-meta {
  padding-top: 1rem;
  border-top: 1px solid #444;
  font-size: 0.75rem;
  color: #999;
}

.details-meta p {
  margin: 0.25rem 0;
}

.users-table {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.table-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  border-bottom: 2px solid #444;
}

.data-table th {
  text-align: left;
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1rem 0.75rem;
  border-bottom: 1px solid #2d2d2d;
  font-size: 0.875rem;
  color: #e0e0e0;
}

.role-badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}

.btn-text:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.permissions-list {
  background: #2d2d2d;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
}

.permissions-list h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #e0e0e0;
}

.permission-category-section {
  margin-bottom: 2rem;
}

.permission-category-section h4 {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.permission-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.permission-card {
  padding: 1rem;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
}

.permission-card h5 {
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #e0e0e0;
}

.permission-card p {
  margin: 0 0 0.75rem 0;
  font-size: 0.75rem;
  color: #999;
  line-height: 1.4;
}

.permission-usage {
  font-size: 0.75rem;
  color: #666;
}
`;
