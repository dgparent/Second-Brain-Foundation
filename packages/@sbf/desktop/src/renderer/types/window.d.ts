/**
 * TypeScript definitions for the window.sbfAPI object
 * Provides type safety for renderer process IPC calls
 */

export interface LifecycleStats {
  active: number;
  stale: number;
  archived: number;
  dissolved: number;
  total: number;
}

export interface EntitySummary {
  uid: string;
  title: string;
  type: string;
  state: string;
  created: string;
  updated: string;
  lastActivity: string;
  metadata: {
    tags: string[];
    description: string;
  };
}

export interface DissolutionCandidate {
  uid: string;
  title: string;
  type: string;
  created: string;
  scheduledFor: string;
  remainingHours: number;
  urgency: 'urgent' | 'warning' | 'normal';
  reason: string;
  content: string;
  fromState: string;
  toState: string;
}

export interface Notification {
  id: string;
  type: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  timestamp: string;
  entityId?: string;
  actionable: boolean;
  read: boolean;
}

export interface PrivacyStats {
  total: number;
  public: number;
  internal: number;
  confidential: number;
  restricted: number;
  secret: number;
  encrypted: number;
}

export interface EncryptionStatus {
  enabled: boolean;
  algorithm: string;
  keyRotationEnabled: boolean;
  lastRotation: string;
  nextRotation: string;
}

export interface AccessControlSummary {
  roles: number;
  users: number;
  activePermissions: number;
  recentAccess: number;
}

export interface EntityClassification {
  uid: string;
  title: string;
  type: string;
  currentLevel: number;
  suggestedLevel: number;
  confidence: number;
  preview: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  lastAccess: string;
}

export interface EncryptionKey {
  id: string;
  algorithm: string;
  created: string;
  lastRotated: string;
  status: string;
}

export interface EncryptionStats {
  totalEntities: number;
  encryptedEntities: number;
  encryptionRate: number;
}

// Main API interface
export interface SBFAPI {
  plugins: {
    list: () => Promise<any[]>;
    load: (pluginId: string) => Promise<{ success: boolean; pluginId: string }>;
    unload: (pluginId: string) => Promise<{ success: boolean; pluginId: string }>;
  };
  
  entities: {
    create: (entity: any) => Promise<any>;
    read: (uid: string) => Promise<any>;
    update: (uid: string, updates: any) => Promise<any>;
    delete: (uid: string) => Promise<{ success: boolean }>;
  };
  
  lifecycle: {
    getStats: () => Promise<LifecycleStats>;
    getAllEntities: () => Promise<EntitySummary[]>;
    getDissolutionQueue: () => Promise<DissolutionCandidate[]>;
    preventDissolution: (params: { entityId: string; reason: string }) => Promise<{ success: boolean }>;
    postponeDissolution: (params: { entityId: string; days: number }) => Promise<{ success: boolean }>;
    approveDissolution: (params: { entityId: string }) => Promise<{ success: boolean; result: any }>;
    getStateHistory: (entityId: string) => Promise<any[]>;
  };
  
  notifications: {
    getAll: () => Promise<Notification[]>;
    markAsRead: (notificationId: string) => Promise<{ success: boolean }>;
    dismiss: (notificationId: string) => Promise<{ success: boolean }>;
  };
  
  privacy: {
    getStats: () => Promise<PrivacyStats>;
    getEncryptionStatus: () => Promise<EncryptionStatus>;
    getAccessControlSummary: () => Promise<AccessControlSummary>;
    getEntitiesForClassification: () => Promise<EntityClassification[]>;
    classifyEntity: (params: { entityId: string; level: number; userId?: string }) => Promise<{ success: boolean }>;
    bulkClassify: (params: { entityIds: string[]; level: number; userId?: string }) => Promise<{ results: any[] }>;
  };
  
  accessControl: {
    getRoles: () => Promise<Role[]>;
    getPermissions: () => Promise<Permission[]>;
    getUsers: () => Promise<User[]>;
  };
  
  encryption: {
    getKeys: () => Promise<EncryptionKey[]>;
    getStats: () => Promise<EncryptionStats>;
    rotateKeys: () => Promise<{ success: boolean; rotatedAt: string }>;
  };
  
  system: {
    platform: () => string;
    version: () => string;
  };
}

// Extend the Window interface
declare global {
  interface Window {
    sbfAPI: SBFAPI;
  }
}

export {};
