/**
 * CLI Configuration Management
 */

import fs from 'fs/promises';
import path from 'path';
import { CLIConfig, DEFAULT_CONFIG } from './types.js';

let config: CLIConfig = { ...DEFAULT_CONFIG };
let configPath: string = '';

/**
 * Find config file by walking up directory tree
 */
async function findConfigFile(startDir: string): Promise<string | null> {
  let currentDir = startDir;
  
  while (true) {
    const configFilePath = path.join(currentDir, '.sbf', 'config.json');
    
    try {
      await fs.access(configFilePath);
      return configFilePath;
    } catch {
      // Not found, try parent
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        // Reached root
        return null;
      }
      currentDir = parentDir;
    }
  }
}

/**
 * Load configuration from .sbf/config.json
 */
export async function loadConfig(cwd?: string): Promise<CLIConfig> {
  const startDir = cwd || process.cwd();
  const foundPath = await findConfigFile(startDir);
  
  if (foundPath) {
    try {
      const content = await fs.readFile(foundPath, 'utf-8');
      const loaded = JSON.parse(content) as Partial<CLIConfig>;
      config = { ...DEFAULT_CONFIG, ...loaded };
      configPath = foundPath;
    } catch (error) {
      // Invalid config, use defaults
      config = { ...DEFAULT_CONFIG };
    }
  } else {
    config = { ...DEFAULT_CONFIG };
  }
  
  // Override with environment variables
  if (process.env.SBF_API_URL) {
    config.apiUrl = process.env.SBF_API_URL;
  }
  if (process.env.SBF_API_KEY) {
    config.apiKey = process.env.SBF_API_KEY;
  }
  
  return config;
}

/**
 * Save configuration to .sbf/config.json
 */
export async function saveConfig(newConfig?: Partial<CLIConfig>, targetDir?: string): Promise<void> {
  if (newConfig) {
    config = { ...config, ...newConfig };
  }
  
  const dir = targetDir || config.vaultPath || process.cwd();
  const sbfDir = path.join(dir, '.sbf');
  const filePath = path.join(sbfDir, 'config.json');
  
  await fs.mkdir(sbfDir, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(config, null, 2));
  
  configPath = filePath;
}

/**
 * Get current configuration
 */
export function getConfig(): CLIConfig {
  return config;
}

/**
 * Get config file path
 */
export function getConfigPath(): string {
  return configPath;
}

/**
 * Check if initialized (config file exists)
 */
export async function isInitialized(dir?: string): Promise<boolean> {
  const targetDir = dir || process.cwd();
  const filePath = path.join(targetDir, '.sbf', 'config.json');
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a specific config value
 */
export function getConfigValue<K extends keyof CLIConfig>(key: K): CLIConfig[K] {
  return config[key];
}

/**
 * Set a specific config value
 */
export async function setConfigValue<K extends keyof CLIConfig>(
  key: K, 
  value: CLIConfig[K]
): Promise<void> {
  config[key] = value;
  await saveConfig();
}
