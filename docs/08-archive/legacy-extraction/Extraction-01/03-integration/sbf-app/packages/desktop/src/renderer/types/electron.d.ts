/**
 * TypeScript definitions for Electron API
 * Available as window.electron in renderer process
 */

export interface VaultAPI {
  selectFolder: () => Promise<string | null>;
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  listFiles: (dirPath: string) => Promise<{
    success: boolean;
    files?: Array<{ name: string; path: string; isDirectory: boolean }>;
    error?: string;
  }>;
}

export interface AppAPI {
  getVersion: () => Promise<string>;
  getPath: (name: string) => Promise<string>;
}

export interface ElectronAPI {
  vault: VaultAPI;
  app: AppAPI;
  platform: NodeJS.Platform;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
