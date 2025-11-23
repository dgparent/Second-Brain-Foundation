/**
 * Plugin Registry
 * Manages registration, enablement, and retrieval of plugins
 */

import { SBFPlugin, PluginRegistry as IPluginRegistry } from '@sbf/shared';
import EventEmitter from 'eventemitter3';

export class PluginRegistry extends EventEmitter implements IPluginRegistry {
  plugins: Map<string, SBFPlugin> = new Map();
  enabled: Set<string> = new Set();
  
  async register(plugin: SBFPlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin ${plugin.id} is already registered`);
    }
    
    // Validate plugin
    this.validatePlugin(plugin);
    
    // Check dependencies
    await this.checkDependencies(plugin);
    
    // Register
    this.plugins.set(plugin.id, plugin);
    
    // Call onInstall hook
    if (plugin.hooks.onInstall) {
      await plugin.hooks.onInstall();
    }
    
    this.emit('plugin:registered', plugin);
  }
  
  async unregister(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    // Disable if enabled
    if (this.enabled.has(pluginId)) {
      await this.disable(pluginId);
    }
    
    // Call onUninstall hook
    if (plugin.hooks.onUninstall) {
      await plugin.hooks.onUninstall();
    }
    
    this.plugins.delete(pluginId);
    this.emit('plugin:unregistered', pluginId);
  }
  
  async enable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (this.enabled.has(pluginId)) {
      return; // Already enabled
    }
    
    // Enable dependencies first
    if (plugin.dependencies) {
      for (const depId of plugin.dependencies) {
        if (!this.enabled.has(depId)) {
          await this.enable(depId);
        }
      }
    }
    
    // Call onEnable hook
    if (plugin.hooks.onEnable) {
      await plugin.hooks.onEnable();
    }
    
    this.enabled.add(pluginId);
    this.emit('plugin:enabled', plugin);
  }
  
  async disable(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }
    
    if (!this.enabled.has(pluginId)) {
      return; // Already disabled
    }
    
    // Check if any enabled plugins depend on this one
    for (const [id, p] of this.plugins) {
      if (this.enabled.has(id) && p.dependencies?.includes(pluginId)) {
        throw new Error(`Cannot disable ${pluginId}: plugin ${id} depends on it`);
      }
    }
    
    // Call onDisable hook
    if (plugin.hooks.onDisable) {
      await plugin.hooks.onDisable();
    }
    
    this.enabled.delete(pluginId);
    this.emit('plugin:disabled', plugin);
  }
  
  get(pluginId: string): SBFPlugin | undefined {
    return this.plugins.get(pluginId);
  }
  
  getAll(): SBFPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  getEnabled(): SBFPlugin[] {
    return Array.from(this.enabled)
      .map(id => this.plugins.get(id))
      .filter((p): p is SBFPlugin => p !== undefined);
  }
  
  private validatePlugin(plugin: SBFPlugin): void {
    if (!plugin.id) {
      throw new Error('Plugin must have an id');
    }
    if (!plugin.name) {
      throw new Error('Plugin must have a name');
    }
    if (!plugin.version) {
      throw new Error('Plugin must have a version');
    }
    if (!plugin.capabilities) {
      throw new Error('Plugin must define capabilities');
    }
    if (!plugin.hooks) {
      throw new Error('Plugin must define hooks');
    }
  }
  
  private async checkDependencies(plugin: SBFPlugin): Promise<void> {
    if (!plugin.dependencies) return;
    
    for (const depId of plugin.dependencies) {
      if (!this.plugins.has(depId)) {
        throw new Error(`Plugin ${plugin.id} requires ${depId} which is not registered`);
      }
    }
  }
}
