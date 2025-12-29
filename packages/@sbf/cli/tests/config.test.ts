/**
 * CLI Config Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Mock fs module
vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockResolvedValue('{}'),
}));

describe('CLI Config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module state
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isInitialized', () => {
    it('should return true when config exists', async () => {
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          apiUrl: 'http://localhost:3000/api',
          apiKey: 'test-key',
        })
      );

      const { isInitialized } = await import('../src/config.js');

      expect(isInitialized()).toBe(true);
    });

    it('should return false when config missing', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { isInitialized } = await import('../src/config.js');

      expect(isInitialized()).toBe(false);
    });
  });

  describe('loadConfig', () => {
    it('should load config from file', async () => {
      const mockConfig = {
        apiUrl: 'http://localhost:3000/api',
        apiKey: 'test-key',
        defaultType: 'note',
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const { loadConfig } = await import('../src/config.js');
      const config = loadConfig();

      expect(config.apiUrl).toBe('http://localhost:3000/api');
      expect(config.apiKey).toBe('test-key');
    });

    it('should return defaults when no config', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { loadConfig, DEFAULT_CONFIG } = await import('../src/config.js');
      const config = loadConfig();

      expect(config.apiUrl).toBe(DEFAULT_CONFIG.apiUrl);
    });

    it('should use environment variables', async () => {
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        SBF_API_URL: 'http://env-url:3000/api',
        SBF_API_KEY: 'env-key',
      };

      vi.mocked(existsSync).mockReturnValue(false);

      const { loadConfig } = await import('../src/config.js');
      const config = loadConfig();

      expect(config.apiUrl).toBe('http://env-url:3000/api');
      expect(config.apiKey).toBe('env-key');

      process.env = originalEnv;
    });
  });

  describe('saveConfig', () => {
    it('should save config to file', async () => {
      vi.mocked(existsSync).mockReturnValue(true);

      const { saveConfig } = await import('../src/config.js');
      const config = {
        apiUrl: 'http://localhost:3000/api',
        apiKey: 'new-key',
        defaultType: 'note',
        editor: 'code',
        outputFormat: 'table' as const,
        syncOnSave: false,
        excludePatterns: [],
      };

      saveConfig(config);

      expect(writeFileSync).toHaveBeenCalled();
    });

    it('should create directory if not exists', async () => {
      vi.mocked(existsSync).mockReturnValue(false);

      const { saveConfig } = await import('../src/config.js');
      const config = {
        apiUrl: 'http://localhost:3000/api',
        apiKey: 'key',
        defaultType: 'note',
        editor: 'code',
        outputFormat: 'table' as const,
        syncOnSave: false,
        excludePatterns: [],
      };

      saveConfig(config);

      expect(mkdirSync).toHaveBeenCalled();
    });
  });

  describe('setConfigValue', () => {
    it('should update single config value', async () => {
      const mockConfig = {
        apiUrl: 'http://localhost:3000/api',
        apiKey: 'old-key',
        defaultType: 'note',
      };

      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockConfig));

      const { setConfigValue, getConfig } = await import('../src/config.js');
      setConfigValue('apiKey', 'new-key');

      expect(writeFileSync).toHaveBeenCalled();
    });
  });
});
