/**
 * Global type definitions for desktop app
 */

interface LifecycleStats {
  active: number;
  stale: number;
  archived: number;
  dissolved: number;
  total: number;
  // Legacy compatibility
  activeEntities?: number;
  staleEntities?: number;
  archivedEntities?: number;
  dissolvedEntities?: number;
}

interface EntitySummary {
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

interface DissolutionCandidate {
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

interface Notification {
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

interface PrivacyStats {
  total: number;
  public: number;
  internal: number;
  confidential: number;
  restricted: number;
  secret: number;
  encrypted: number;
  // Legacy compatibility
  totalEntities: number;
  publicEntities?: number;
  personalEntities?: number;
  privateEntities?: number;
  confidentialEntities?: number;
  encryptedEntities?: number;
  encryptionPercentage?: number;
  byLevel?: any;
  withAccessControls?: number;
  recentAuditEvents?: number;
}

interface EncryptionStatus {
  enabled: boolean;
  algorithm: string;
  keyRotationEnabled: boolean;
  lastRotation: string;
  nextRotation: string;
  // Legacy
  keyRotationDate?: string | Date;
  encryptedEntities: number;
  totalEntities: number;
}

interface AccessControlSummary {
  roles: number;
  users: number;
  activePermissions: number;
  recentAccess: number;
  // Legacy
  totalRoles: number;
  totalPermissions: number;
  activeUsers: number;
  recentChanges: number;
}

interface EntityClassification {
  uid: string;
  title: string;
  type: string;
  currentLevel: number;
  suggestedLevel: number;
  confidence: number;
  preview: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  lastAccess: string;
}

interface EncryptionKey {
  id: string;
  algorithm: string;
  created: string;
  lastRotated: string;
  status: string;
}

interface EncryptionStats {
  totalEntities: number;
  encryptedEntities: number;
  encryptionRate: number;
  // Legacy
  encryptionPercentage?: number;
  activeKeys?: number;
  lastRotation?: string | Date;
  recommendedRotation?: any;
}

interface SBFApi {
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
    getAll: () => Promise<EntitySummary[]>;
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

  config: {
    get: () => Promise<any>;
    set: (config: any) => Promise<{ success: boolean }>;
  };

  persona: {
    setActive: (persona: any) => Promise<{ success: boolean }>;
  };

  va: {
    query: (query: string) => Promise<any>;
    getConstitution: () => Promise<any>;
    updateConstitution: (rules: any) => Promise<any>;
  };

  ai: {
    extract: (text: string) => Promise<{ entities: any[]; classification: any }>;
    generate: (params: { prompt: string }) => Promise<string>;
  };

  tasks: {
    create: (params: { title: string; priority?: string; options?: any }) => Promise<any>;
    getAll: () => Promise<any[]>;
    updateStatus: (params: { uid: string; status: string }) => Promise<any>;
  };

  finance: {
    createAccount: (params: any) => Promise<any>;
    logTransaction: (params: any) => Promise<any>;
    getAccounts: () => Promise<any[]>;
    getTransactions: (accountUid?: string) => Promise<any[]>;
    getNetWorth: () => Promise<any>;
    addAsset: (params: any) => Promise<any>;
    getAssets: (accountUid?: string) => Promise<any[]>;
    getPortfolioValue: (currency?: string) => Promise<any>;
    getAllocation: () => Promise<any>;
  };

  fitness: {
    logMetric: (params: any) => Promise<any>;
    logWorkout: (params: any) => Promise<any>;
    getMetrics: (metricType?: string) => Promise<any[]>;
    getWorkouts: () => Promise<any[]>;
    getLatestMetric: (metricType: string) => Promise<any>;
    logMeal: (params: any) => Promise<any>;
    getMeals: (params: { startDate?: string; endDate?: string }) => Promise<any[]>;
    getDailyNutrition: (date: string) => Promise<any>;
    addMedication: (params: any) => Promise<any>;
    getActiveMedications: () => Promise<any[]>;
    logDose: (params: { medicationId: string; timestamp: Date }) => Promise<any>;
  };

  learning: {
    addResource: (params: any) => Promise<any>;
    getResources: (status?: string) => Promise<any[]>;
    updateProgress: (params: { uid: string; percent: number; status?: string }) => Promise<any>;
  };

  legal: {
    createCase: (params: any) => Promise<any>;
    getCases: (status?: string) => Promise<any[]>;
  };

  property: {
    addProperty: (params: any) => Promise<any>;
    getProperties: (status?: string) => Promise<any[]>;
  };

  haccp: {
    logEntry: (params: any) => Promise<any>;
    getLogs: (params: { startDate?: string; endDate?: string }) => Promise<any[]>;
  };

  crm: {
    createContact: (params: any) => Promise<any>;
    logInteraction: (params: any) => Promise<any>;
    getContacts: () => Promise<any[]>;
    getInteractions: (contactUid?: string) => Promise<any[]>;
  };
}

declare global {
  interface Window {
    sbfAPI: SBFApi;
    // Legacy support - alias to sbfAPI
    electron: SBFApi;
  }
}

export {};
