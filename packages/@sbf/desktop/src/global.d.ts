/**
 * Global type definitions for desktop app
 */

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
    getAll: () => Promise<any[]>;
  };

  lifecycle: {
    getStats: () => Promise<{
      active?: number;
      stale?: number;
      archived?: number;
      dissolved?: number;
      total?: number;
      activeEntities?: number;
      staleEntities?: number;
      archivedEntities?: number;
      dissolvedEntities?: number;
    }>;
    getAllEntities: () => Promise<any[]>;
    getDissolutionQueue: () => Promise<any[]>;
    preventDissolution: (params: { entityId: string; reason: string }) => Promise<{ success: boolean }>;
    postponeDissolution: (params: { entityId: string; days: number }) => Promise<{ success: boolean }>;
    approveDissolution: (params: { entityId: string }) => Promise<{ success: boolean; result: any }>;
    getStateHistory: (entityId: string) => Promise<any[]>;
  };

  notifications: {
    getAll: () => Promise<any[]>;
    markAsRead: (notificationId: string) => Promise<{ success: boolean }>;
    dismiss: (notificationId: string) => Promise<{ success: boolean }>;
  };

  privacy: {
    getStats: () => Promise<{
      totalEntities: number;
      encryptedEntities?: number;
      encryptionPercentage?: number;
      publicEntities?: number;
      personalEntities?: number;
      privateEntities?: number;
      confidentialEntities?: number;
      byLevel?: any;
      encrypted?: number;
      withAccessControls?: number;
      recentAuditEvents?: number;
    }>;
    getEncryptionStatus: () => Promise<any>;
    getAccessControlSummary: () => Promise<any>;
    getEntitiesForClassification: () => Promise<any[]>;
    classifyEntity: (params: { entityId: string; level: number; userId?: string }) => Promise<{ success: boolean }>;
    bulkClassify: (params: { entityIds: string[]; level: number; userId?: string }) => Promise<{ results: any[] }>;
  };

  accessControl: {
    getRoles: () => Promise<any[]>;
    getPermissions: () => Promise<any[]>;
    getUsers: () => Promise<any[]>;
  };

  encryption: {
    getKeys: () => Promise<any[]>;
    getStats: () => Promise<any>;
    rotateKeys: () => Promise<{ success: boolean; rotatedAt: string }>;
  };

  system: {
    platform: () => string;
    version: () => string;
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
