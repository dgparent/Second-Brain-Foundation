/**
 * SBF Desktop - Main Process
 * Electron main process entry point
 * 
 * Based on:
 * - FreedomGPT/main/index.ts (Electron setup)
 * - AnythingLLM desktop patterns
 * - SBF architecture specs
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { Vault } from '@sbf/core';

// Development mode check
const isDev = process.env.NODE_ENV === 'development';

// Main window reference
let mainWindow: BrowserWindow | null = null;

// Vault instance (initialized when user selects folder)
let vault: Vault | null = null;

/**
 * Create main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#1a1a1a', // Dark background (SBF design principle)
    show: false, // Show when ready
    webPreferences: {
      nodeIntegration: false, // Security: disable node in renderer
      contextIsolation: true,  // Security: isolate contexts
      sandbox: true,           // Security: sandbox renderer
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // Load renderer
  if (isDev) {
    // Development: Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Built files
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }

  // Show window when ready (prevent flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Cleanup on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * App lifecycle
 */
app.whenReady().then(() => {
  createWindow();

  // macOS: Re-create window when dock icon clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * IPC Handlers
 * Secure communication between renderer and main process
 * All vault operations delegate to Vault class (no duplication)
 */

// Vault initialization
ipcMain.handle('vault:select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Vault Folder',
  });
  
  if (result.canceled) {
    return { success: false, path: null };
  }
  
  try {
    // Initialize vault with selected folder
    vault = new Vault(result.filePaths[0]);
    await vault.initialize();
    return { success: true, path: result.filePaths[0] };
  } catch (error) {
    return { success: false, error: (error as Error).message, path: null };
  }
});

// Read file (delegates to Vault)
ipcMain.handle('vault:read-file', async (_event, filePath: string) => {
  if (!vault) {
    return { success: false, error: 'Vault not initialized' };
  }
  
  try {
    const fileContent = await vault.readFile(filePath);
    if (!fileContent) {
      return { success: false, error: 'File not found' };
    }
    return { success: true, ...fileContent };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Write file (delegates to Vault)
ipcMain.handle('vault:write-file', async (_event, filePath: string, frontmatter: Record<string, any>, content: string) => {
  if (!vault) {
    return { success: false, error: 'Vault not initialized' };
  }
  
  try {
    await vault.writeFile(filePath, frontmatter, content);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// List files (delegates to Vault)
ipcMain.handle('vault:list-files', async (_event, folderPath: string = '') => {
  if (!vault) {
    return { success: false, error: 'Vault not initialized' };
  }
  
  try {
    const tree = await vault.listFiles(folderPath);
    return { success: true, tree };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Delete file (delegates to Vault)
ipcMain.handle('vault:delete-file', async (_event, filePath: string) => {
  if (!vault) {
    return { success: false, error: 'Vault not initialized' };
  }
  
  try {
    await vault.deleteFile(filePath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// Create folder (delegates to Vault)
ipcMain.handle('vault:create-folder', async (_event, folderPath: string) => {
  if (!vault) {
    return { success: false, error: 'Vault not initialized' };
  }
  
  try {
    await vault.createFolder(folderPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

// App info
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

ipcMain.handle('app:get-path', (_event, name: string) => {
  return app.getPath(name as any);
});

/**
 * Error handling
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
