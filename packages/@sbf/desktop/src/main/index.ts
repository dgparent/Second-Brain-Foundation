import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as path from 'path';
import { EntityManager } from '@sbf/core-entity-manager';
import { MemoryEngine } from '@sbf/memory-engine';
import { LifecycleEngine, DissolutionWorkflow, EntityExtractionWorkflow } from '@sbf/core-lifecycle-engine';
import { PrivacyService, InMemoryAuditStorage } from '@sbf/core-privacy';
import { setupIPCHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Initialize backend services
let entityManager: EntityManager;
let memoryEngine: MemoryEngine;
let lifecycleEngine: LifecycleEngine;
let dissolutionWorkflow: DissolutionWorkflow;
let privacyService: PrivacyService;

async function initializeBackendServices() {
  try {
    console.log('Initializing backend services...');
    
    // TODO: Desktop module needs refactoring to match current architecture
    // Current issues:
    // 1. EntityManager now requires KnowledgeGraph, not MemoryEngine
    // 2. DissolutionWorkflow requires EntityExtractionWorkflow with AI provider
    // 3. Need to create proper KnowledgeGraph instance
    // 4. Need to install electron types: npm install --save-dev @types/electron
    
    // Initialize Memory Engine
    const vaultRoot = path.join(app.getPath('userData'), 'vault');
    memoryEngine = new MemoryEngine({ vaultRoot });
    
    // Initialize Entity Manager - TEMPORARILY DISABLED
    // entityManager = new EntityManager(memoryEngine);  // Type mismatch - needs KnowledgeGraph
    
    // Initialize Lifecycle Engine - TEMPORARILY DISABLED
    // lifecycleEngine = new LifecycleEngine(entityManager);
    // lifecycleEngine.start(60); // Check every 60 minutes
    
    // Initialize Privacy Service
    const auditStorage = new InMemoryAuditStorage();
    privacyService = new PrivacyService(auditStorage);
    
    // Initialize Dissolution Workflow - TEMPORARILY DISABLED
    // dissolutionWorkflow = new DissolutionWorkflow({
    //   entityManager,
    //   extractionWorkflow: null as any,  // Requires AI provider
    //   archiveEnabled: true,
    // });
    
    console.log('✅ Backend services initialized successfully (partial - needs refactoring)');
  } catch (error) {
    console.error('❌ Failed to initialize backend services:', error);
    throw error;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../../assets/icon.png')
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/tray-icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show App', 
      click: () => {
        mainWindow?.show();
      }
    },
    { 
      label: 'Quit', 
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Second Brain Foundation');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

app.on('ready', async () => {
  try {
    // Initialize backend services first
    await initializeBackendServices();
    
    // Create window and tray
    createWindow();
    createTray();
    
    // Set up IPC handlers with initialized services
    // TODO: These services are currently disabled pending architecture refactoring
    setupIPCHandlers({
      entityManager: entityManager!,  // Non-null assertion - will need fixing
      lifecycleEngine: lifecycleEngine!,
      dissolutionWorkflow: dissolutionWorkflow!,
      privacyService,
    });
    
    // Also setup legacy handlers
    setupLegacyHandlers();
    
    console.log('✅ Application ready');
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  // Cleanup
  if (lifecycleEngine) {
    lifecycleEngine.stop();
  }
  if (memoryEngine) {
    memoryEngine.shutdown?.();
  }
});

function setupLegacyHandlers() {
  // Plugin loading
  ipcMain.handle('plugin:list', async () => {
    // TODO: Implement plugin discovery
    return [];
  });

  ipcMain.handle('plugin:load', async (event, pluginId: string) => {
    // TODO: Implement plugin loading
    return { success: true, pluginId };
  });

  ipcMain.handle('plugin:unload', async (event, pluginId: string) => {
    // TODO: Implement plugin unloading
    return { success: true, pluginId };
  });

  // Entity operations
  ipcMain.handle('entity:create', async (event, entity: any) => {
    try {
      const created = await entityManager.create(entity);
      return created;
    } catch (error) {
      console.error('Error creating entity:', error);
      throw error;
    }
  });

  ipcMain.handle('entity:read', async (event, uid: string) => {
    try {
      const entity = await entityManager.get(uid);
      return entity;
    } catch (error) {
      console.error('Error reading entity:', error);
      throw error;
    }
  });

  ipcMain.handle('entity:update', async (event, uid: string, updates: any) => {
    try {
      const updated = await entityManager.update(uid, updates);
      return updated;
    } catch (error) {
      console.error('Error updating entity:', error);
      throw error;
    }
  });

  ipcMain.handle('entity:delete', async (event, uid: string) => {
    try {
      await entityManager.delete(uid);
      return { success: true };
    } catch (error) {
      console.error('Error deleting entity:', error);
      throw error;
    }
  });

  ipcMain.handle('entity:getAll', async () => {
    try {
      const entities = await entityManager.getAll();
      return entities;
    } catch (error) {
      console.error('Error getting all entities:', error);
      throw error;
    }
  });
}
