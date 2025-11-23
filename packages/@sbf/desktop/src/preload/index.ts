import { contextBridge, ipcRenderer } from 'electron';

// Define the API object
const api = {
  // Plugin APIs
  plugins: {
    list: () => ipcRenderer.invoke('plugin:list'),
    load: (pluginId: string) => ipcRenderer.invoke('plugin:load', pluginId),
    unload: (pluginId: string) => ipcRenderer.invoke('plugin:unload', pluginId)
  },

  // Entity APIs
  entities: {
    create: (entity: any) => ipcRenderer.invoke('entity:create', entity),
    read: (uid: string) => ipcRenderer.invoke('entity:read', uid),
    update: (uid: string, updates: any) => ipcRenderer.invoke('entity:update', uid, updates),
    delete: (uid: string) => ipcRenderer.invoke('entity:delete', uid),
    getAll: () => ipcRenderer.invoke('entity:getAll')
  },

  // Lifecycle APIs
  lifecycle: {
    getStats: () => ipcRenderer.invoke('lifecycle:getStats'),
    getAllEntities: () => ipcRenderer.invoke('lifecycle:getAllEntities'),
    getDissolutionQueue: () => ipcRenderer.invoke('lifecycle:getDissolutionQueue'),
    preventDissolution: (params: { entityId: string; reason: string }) => 
      ipcRenderer.invoke('lifecycle:preventDissolution', params),
    postponeDissolution: (params: { entityId: string; days: number }) => 
      ipcRenderer.invoke('lifecycle:postponeDissolution', params),
    approveDissolution: (params: { entityId: string }) => 
      ipcRenderer.invoke('lifecycle:approveDissolution', params),
    getStateHistory: (entityId: string) => 
      ipcRenderer.invoke('lifecycle:getStateHistory', entityId)
  },

  // Notification APIs
  notifications: {
    getAll: () => ipcRenderer.invoke('notifications:getAll'),
    markAsRead: (notificationId: string) => ipcRenderer.invoke('notifications:markAsRead', notificationId),
    dismiss: (notificationId: string) => ipcRenderer.invoke('notifications:dismiss', notificationId)
  },

  // Privacy APIs
  privacy: {
    getStats: () => ipcRenderer.invoke('privacy:getStats'),
    getEncryptionStatus: () => ipcRenderer.invoke('privacy:getEncryptionStatus'),
    getAccessControlSummary: () => ipcRenderer.invoke('privacy:getAccessControlSummary'),
    getEntitiesForClassification: () => ipcRenderer.invoke('privacy:getEntitiesForClassification'),
    classifyEntity: (params: { entityId: string; level: number; userId?: string }) => 
      ipcRenderer.invoke('privacy:classifyEntity', params),
    bulkClassify: (params: { entityIds: string[]; level: number; userId?: string }) => 
      ipcRenderer.invoke('privacy:bulkClassify', params)
  },

  // Access Control APIs
  accessControl: {
    getRoles: () => ipcRenderer.invoke('access-control:getRoles'),
    getPermissions: () => ipcRenderer.invoke('access-control:getPermissions'),
    getUsers: () => ipcRenderer.invoke('access-control:getUsers')
  },

  // Encryption APIs
  encryption: {
    getKeys: () => ipcRenderer.invoke('encryption:getKeys'),
    getStats: () => ipcRenderer.invoke('encryption:getStats'),
    rotateKeys: () => ipcRenderer.invoke('encryption:rotateKeys')
  },

  // System APIs
  system: {
    platform: () => process.platform,
    version: () => process.versions.electron
  }
};

// Expose API with both names for compatibility
contextBridge.exposeInMainWorld('sbfAPI', api);
contextBridge.exposeInMainWorld('electron', api);
