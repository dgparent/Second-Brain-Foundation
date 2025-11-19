/**
 * SBF Desktop - Preload Script
 * Secure IPC bridge between main and renderer processes
 * 
 * Based on:
 * - FreedomGPT/preload.ts (secure IPC patterns)
 * - Electron security best practices
 */

import { contextBridge, ipcRenderer } from 'electron';

/**
 * Exposed API for renderer process
 * Only expose safe, validated methods
 */
const electronAPI = {
  // Vault operations
  vault: {
    selectFolder: () => ipcRenderer.invoke('vault:select-folder'),
    readFile: (filePath: string) => ipcRenderer.invoke('vault:read-file', filePath),
    writeFile: (filePath: string, frontmatter: Record<string, any>, content: string) => 
      ipcRenderer.invoke('vault:write-file', filePath, frontmatter, content),
    listFiles: (folderPath?: string) => ipcRenderer.invoke('vault:list-files', folderPath),
    deleteFile: (filePath: string) => ipcRenderer.invoke('vault:delete-file', filePath),
    createFolder: (folderPath: string) => ipcRenderer.invoke('vault:create-folder', folderPath),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    getPath: (name: string) => ipcRenderer.invoke('app:get-path', name),
  },

  // Platform info
  platform: process.platform,
};

/**
 * Expose API to renderer
 * Available as window.electron in renderer process
 */
contextBridge.exposeInMainWorld('electron', electronAPI);

/**
 * TypeScript definitions for window.electron
 * Copy to renderer/types/electron.d.ts
 */
export type ElectronAPI = typeof electronAPI;

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
