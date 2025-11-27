import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import * as path from 'path';
import { EntityManager } from '@sbf/core-entity-manager';
import { KnowledgeGraph } from '@sbf/core-knowledge-graph';
import { MemoryEngine } from '@sbf/memory-engine';
import { LifecycleEngine, DissolutionWorkflow, EntityExtractionWorkflow } from '@sbf/core-lifecycle-engine';
import { PrivacyService, InMemoryAuditStorage } from '@sbf/core-privacy';
import { BaseAIProvider, OllamaProvider } from '@sbf/aei';
import { VAService } from '@sbf/va-dashboard';
import { TaskService } from '@sbf/personal-tasks';
import { BudgetService } from '@sbf/budgeting';
import { FitnessService } from '@sbf/fitness-tracking';
import { CRMService } from '@sbf/relationship-crm';
import { PortfolioService } from '@sbf/portfolio-tracking';
import { NutritionService } from '@sbf/nutrition-tracking';
import { MedicationService } from '@sbf/medication-tracking';
import { LearningService } from '@sbf/learning-tracker';
import { LegalService } from '@sbf/legal-ops';
import { PropertyService } from '@sbf/property-mgmt';
import { HACCPService } from '@sbf/restaurant-haccp';
import { setupIPCHandlers } from './ipc-handlers';
import { PluginManager } from './PluginManager';
import { ConfigManager } from './ConfigManager';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Initialize backend services
let knowledgeGraph: KnowledgeGraph;
let entityManager: EntityManager;
let memoryEngine: MemoryEngine;
let lifecycleEngine: LifecycleEngine;
let dissolutionWorkflow: DissolutionWorkflow;
let privacyService: PrivacyService;
let aiProvider: BaseAIProvider;
let vaService: VAService;
let taskService: TaskService;
let budgetService: BudgetService;
let fitnessService: FitnessService;
let crmService: CRMService;
let portfolioService: PortfolioService;
let nutritionService: NutritionService;
let medicationService: MedicationService;
let learningService: LearningService;
let legalService: LegalService;
let propertyService: PropertyService;
let haccpService: HACCPService;
let pluginManager: PluginManager;
let configManager: ConfigManager;

async function initializeBackendServices() {
  try {
    console.log('Initializing backend services...');
    
    // Initialize Config Manager
    configManager = new ConfigManager();
    const config = configManager.getConfig();

    // Initialize Plugin Manager
    pluginManager = new PluginManager();
    
    // Initialize Memory Engine
    const vaultRoot = path.join(app.getPath('userData'), 'vault');
    memoryEngine = new MemoryEngine({ vaultRoot });

    // Initialize Knowledge Graph
    knowledgeGraph = new KnowledgeGraph();
    
    // Initialize Entity Manager
    entityManager = new EntityManager(knowledgeGraph);
    
    // Initialize Lifecycle Engine
    lifecycleEngine = new LifecycleEngine(entityManager);
    lifecycleEngine.start(60); // Check every 60 minutes
    
    // Initialize Privacy Service
    const auditStorage = new InMemoryAuditStorage();
    privacyService = new PrivacyService(auditStorage);

    // Initialize AI Provider from Config
    aiProvider = new OllamaProvider({
      model: config.ai.model,
      baseUrl: config.ai.baseUrl
    });

    // Initialize Extraction Workflow
    const extractionWorkflow = new EntityExtractionWorkflow({
      provider: aiProvider,
      entityManager
    });
    
    // Initialize Dissolution Workflow
    dissolutionWorkflow = new DissolutionWorkflow({
      entityManager,
      extractionWorkflow,
      archiveEnabled: true,
    });

    // Initialize VA Service
    vaService = new VAService(entityManager, aiProvider);

    // Initialize Task Service
    taskService = new TaskService(entityManager, aiProvider);

    // Initialize Budget Service
    budgetService = new BudgetService(entityManager, aiProvider);

    // Initialize Fitness Service
    fitnessService = new FitnessService(entityManager, aiProvider);

    // Initialize CRM Service
    crmService = new CRMService(entityManager, aiProvider);

    // Initialize Portfolio Service
    portfolioService = new PortfolioService(entityManager, aiProvider);

    // Initialize Nutrition Service
    nutritionService = new NutritionService(entityManager, aiProvider);

    // Initialize Medication Service
    medicationService = new MedicationService(entityManager);

    // Initialize Learning Service
    learningService = new LearningService(entityManager, aiProvider);

    // Initialize Legal Service
    legalService = new LegalService(entityManager, aiProvider);

    // Initialize Property Service
    propertyService = new PropertyService(entityManager, aiProvider);

    // Initialize HACCP Service
    haccpService = new HACCPService(entityManager, aiProvider);
    
    console.log('✅ Backend services initialized successfully');
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
    if (!(app as any).isQuitting) {
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
        (app as any).isQuitting = true;
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
    setupIPCHandlers({
      entityManager,
      lifecycleEngine,
      dissolutionWorkflow,
      privacyService,
      vaService,
      taskService,
      budgetService,
      fitnessService,
      crmService,
      portfolioService,
      nutritionService,
      medicationService,
      learningService,
      legalService,
      propertyService,
      haccpService,
      aiProvider,
      configManager,
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
    return await pluginManager.discoverPlugins();
  });

  ipcMain.handle('plugin:load', async (event, pluginId: string) => {
    const success = await pluginManager.loadPlugin(pluginId);
    return { success, pluginId };
  });

  ipcMain.handle('plugin:unload', async (event, pluginId: string) => {
    const success = await pluginManager.unloadPlugin(pluginId);
    return { success, pluginId };
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
