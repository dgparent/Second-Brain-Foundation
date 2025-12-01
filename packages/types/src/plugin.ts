export interface PluginManifest {
  id: string;
  version: string;
  name: string;
  description?: string;
  author?: string;
}

export interface PluginContext {
  logger: any; 
  events: any;
  config: any;
}

export interface SBFPlugin {
  manifest: PluginManifest;
  
  /**
   * Called when the plugin is loaded.
   * Use this to register event listeners, routes, or initialize state.
   */
  onLoad(context: PluginContext): Promise<void>;

  /**
   * Called when the plugin is unloaded or the system shuts down.
   */
  onUnload(): Promise<void>;

  /**
   * Return a list of AI tools provided by this plugin.
   */
  getTools?(): any[];
}
