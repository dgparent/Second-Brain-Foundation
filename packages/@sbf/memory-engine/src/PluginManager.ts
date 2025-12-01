import { SBFPlugin, PluginContext } from '@sbf/types';

export class PluginManager {
  private plugins: Map<string, SBFPlugin> = new Map();
  private logger: any;
  private context: PluginContext;

  constructor(logger: any, context: Omit<PluginContext, 'logger'>) {
    this.logger = logger;
    this.context = { ...context, logger };
  }

  async registerPlugin(plugin: SBFPlugin) {
    if (this.plugins.has(plugin.manifest.id)) {
      this.logger.warn(`Plugin ${plugin.manifest.id} is already registered.`);
      return;
    }

    try {
      this.logger.info(`Loading plugin: ${plugin.manifest.name} (${plugin.manifest.version})`);
      await plugin.onLoad(this.context);
      this.plugins.set(plugin.manifest.id, plugin);
      this.logger.info(`Plugin loaded: ${plugin.manifest.id}`);
    } catch (error) {
      this.logger.error(`Failed to load plugin ${plugin.manifest.id}`, error);
      throw error;
    }
  }

  async unloadAll() {
    for (const [id, plugin] of this.plugins) {
      try {
        await plugin.onUnload();
        this.logger.info(`Unloaded plugin: ${id}`);
      } catch (error) {
        this.logger.error(`Error unloading plugin ${id}`, error);
      }
    }
    this.plugins.clear();
  }

  getAllTools(): any[] {
    const tools: any[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.getTools) {
        tools.push(...plugin.getTools());
      }
    }
    return tools;
  }

  getPlugin(id: string): SBFPlugin | undefined {
    return this.plugins.get(id);
  }
}
