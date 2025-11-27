import { contextBridge, ipcRenderer } from 'electron';

// Define the API object
const api = {
  // Config APIs
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    set: (newConfig: any) => ipcRenderer.invoke('config:set', newConfig)
  },

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
  },

  // VA APIs
  va: {
    query: (query: string) => ipcRenderer.invoke('va:query', query),
    getConstitution: () => ipcRenderer.invoke('va:getConstitution'),
    updateConstitution: (rules: any[]) => ipcRenderer.invoke('va:updateConstitution', rules)
  },

  // AI APIs
  ai: {
    extract: (text: string) => ipcRenderer.invoke('ai:extract', text),
    generate: (params: { prompt: string }) => ipcRenderer.invoke('ai:generate', params)
  },

  // Task APIs
  tasks: {
    create: (params: { title: string; priority?: string; options?: any }) => 
      ipcRenderer.invoke('tasks:create', params),
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    updateStatus: (params: { uid: string; status: string }) => 
      ipcRenderer.invoke('tasks:updateStatus', params)
  },

  // Finance APIs
  finance: {
    createAccount: (params: any) => ipcRenderer.invoke('finance:createAccount', params),
    logTransaction: (params: any) => ipcRenderer.invoke('finance:logTransaction', params),
    getAccounts: () => ipcRenderer.invoke('finance:getAccounts'),
    getTransactions: (accountUid?: string) => ipcRenderer.invoke('finance:getTransactions', accountUid),
    getNetWorth: () => ipcRenderer.invoke('finance:getNetWorth'),
    // Portfolio
    addAsset: (params: any) => ipcRenderer.invoke('finance:addAsset', params),
    getAssets: (accountUid?: string) => ipcRenderer.invoke('finance:getAssets', accountUid),
    getPortfolioValue: (currency?: string) => ipcRenderer.invoke('finance:getPortfolioValue', currency),
    getAllocation: () => ipcRenderer.invoke('finance:getAllocation')
  },

  // Fitness APIs
  fitness: {
    logMetric: (params: any) => ipcRenderer.invoke('fitness:logMetric', params),
    logWorkout: (params: any) => ipcRenderer.invoke('fitness:logWorkout', params),
    getMetrics: (metricType?: string) => ipcRenderer.invoke('fitness:getMetrics', metricType),
    getWorkouts: () => ipcRenderer.invoke('fitness:getWorkouts'),
    getLatestMetric: (metricType: string) => ipcRenderer.invoke('fitness:getLatestMetric', metricType),
    // Nutrition
    logMeal: (params: any) => ipcRenderer.invoke('fitness:logMeal', params),
    getMeals: (params: { startDate?: string; endDate?: string }) => ipcRenderer.invoke('fitness:getMeals', params),
    getDailyNutrition: (date: string) => ipcRenderer.invoke('fitness:getDailyNutrition', date),
    // Medication
    addMedication: (params: any) => ipcRenderer.invoke('fitness:addMedication', params),
    getActiveMedications: () => ipcRenderer.invoke('fitness:getActiveMedications'),
    logDose: (params: { medicationId: string; timestamp: Date }) => ipcRenderer.invoke('fitness:logDose', params)
  },

  // Learning APIs
  learning: {
    addResource: (params: any) => ipcRenderer.invoke('learning:addResource', params),
    getResources: (status?: string) => ipcRenderer.invoke('learning:getResources', status),
    updateProgress: (params: { uid: string; percent: number; status?: string }) => 
      ipcRenderer.invoke('learning:updateProgress', params)
  },

  // Legal APIs
  legal: {
    createCase: (params: any) => ipcRenderer.invoke('legal:createCase', params),
    getCases: (status?: string) => ipcRenderer.invoke('legal:getCases', status)
  },

  // Property APIs
  property: {
    addProperty: (params: any) => ipcRenderer.invoke('property:addProperty', params),
    getProperties: (status?: string) => ipcRenderer.invoke('property:getProperties', status)
  },

  // HACCP APIs
  haccp: {
    logEntry: (params: any) => ipcRenderer.invoke('haccp:logEntry', params),
    getLogs: (params: { startDate?: string; endDate?: string }) => ipcRenderer.invoke('haccp:getLogs', params)
  },

  // CRM APIs
  crm: {
    createContact: (params: any) => ipcRenderer.invoke('crm:createContact', params),
    logInteraction: (params: any) => ipcRenderer.invoke('crm:logInteraction', params),
    getContacts: () => ipcRenderer.invoke('crm:getContacts'),
    getInteractions: (contactUid?: string) => ipcRenderer.invoke('crm:getInteractions', contactUid)
  }
};

// Expose API with both names for compatibility
contextBridge.exposeInMainWorld('sbfAPI', api);
contextBridge.exposeInMainWorld('electron', api);
