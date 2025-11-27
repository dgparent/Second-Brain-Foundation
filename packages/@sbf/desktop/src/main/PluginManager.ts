import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  main: string;
}

export interface Plugin {
  manifest: PluginManifest;
  instance?: any;
  status: 'loaded' | 'error' | 'disabled';
  error?: string;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private pluginsDir: string;

  constructor() {
    this.pluginsDir = path.join(app.getPath('userData'), 'plugins');
    this.ensurePluginsDir();
  }

  private ensurePluginsDir() {
    if (!fs.existsSync(this.pluginsDir)) {
      fs.mkdirSync(this.pluginsDir, { recursive: true });
    }
  }

  async discoverPlugins(): Promise<PluginManifest[]> {
    const manifests: PluginManifest[] = [];
    
    try {
      const entries = await fs.promises.readdir(this.pluginsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const manifestPath = path.join(this.pluginsDir, entry.name, 'package.json');
          if (fs.existsSync(manifestPath)) {
            try {
              const content = await fs.promises.readFile(manifestPath, 'utf-8');
              const manifest = JSON.parse(content);
              
              // Basic validation
              if (manifest.name && manifest.version && manifest.main) {
                manifests.push({
                  id: manifest.name,
                  name: manifest.displayName || manifest.name,
                  version: manifest.version,
                  description: manifest.description,
                  main: manifest.main
                });
              }
            } catch (e) {
              console.error(`Failed to load plugin manifest for ${entry.name}:`, e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Error discovering plugins:', e);
    }

    return manifests;
  }

  async loadPlugin(pluginId: string): Promise<boolean> {
    // In a real implementation, we would require() the plugin's main file
    // and call its activate() method.
    // For now, we just mark it as loaded.
    console.log(`Loading plugin: ${pluginId}`);
    return true;
  }

  async unloadPlugin(pluginId: string): Promise<boolean> {
    console.log(`Unloading plugin: ${pluginId}`);
    return true;
  }
}
