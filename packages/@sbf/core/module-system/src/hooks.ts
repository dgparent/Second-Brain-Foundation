/**
 * Plugin Hooks - Event system for plugin lifecycle and interactions
 */

export interface PluginHook {
  name: string;
  handler: (...args: any[]) => any;
}

export class HookManager {
  private hooks: Map<string, Set<Function>> = new Map();

  register(hookName: string, handler: Function): void {
    if (!this.hooks.has(hookName)) {
      this.hooks.set(hookName, new Set());
    }
    this.hooks.get(hookName)!.add(handler);
  }

  unregister(hookName: string, handler: Function): void {
    this.hooks.get(hookName)?.delete(handler);
  }

  async execute(hookName: string, ...args: any[]): Promise<any[]> {
    const handlers = this.hooks.get(hookName);
    if (!handlers || handlers.size === 0) {
      return [];
    }

    const results = [];
    for (const handler of handlers) {
      try {
        results.push(await handler(...args));
      } catch (error) {
        console.error(`Hook ${hookName} handler failed:`, error);
      }
    }
    return results;
  }
}

export const globalHooks = new HookManager();
