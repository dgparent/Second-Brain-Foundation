/**
 * Plugin Context - Provides runtime context and services to plugins
 */

export interface PluginContext {
  pluginId: string;
  config: Record<string, any>;
  logger: {
    info: (message: string) => void;
    error: (message: string) => void;
    warn: (message: string) => void;
    debug: (message: string) => void;
  };
}

export function createPluginContext(pluginId: string, config?: Record<string, any>): PluginContext {
  return {
    pluginId,
    config: config || {},
    logger: {
      info: (message) => console.log(`[${pluginId}] INFO:`, message),
      error: (message) => console.error(`[${pluginId}] ERROR:`, message),
      warn: (message) => console.warn(`[${pluginId}] WARN:`, message),
      debug: (message) => console.debug(`[${pluginId}] DEBUG:`, message),
    },
  };
}
