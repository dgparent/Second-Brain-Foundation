import { SBFPlugin, PluginContext } from '@sbf/types';

export const ExamplePlugin: SBFPlugin = {
  manifest: {
    id: 'example-plugin',
    name: 'Example Plugin',
    version: '0.1.0',
    description: 'A simple example plugin for SBF'
  },

  async onLoad(context: PluginContext) {
    context.logger.info('Example Plugin Loaded!');
    // Example: Subscribe to an event
    if (context.events) {
        context.events.on('entity:created', (entity: any) => {
            context.logger.info(`[ExamplePlugin] Entity created: ${entity.id}`);
        });
    }
  },

  async onUnload() {
    console.log('Example Plugin Unloaded');
  },

  getTools() {
    return [
      {
        name: 'example_tool',
        description: 'An example tool',
        func: async () => 'Hello from Example Plugin!'
      }
    ];
  }
};
