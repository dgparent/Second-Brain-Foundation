/**
 * Plugin System Types
 * Enables modular domain-specific extensions
 */

import { Entity, EntityType, EntityTemplate } from './entity';
import { LifecycleState, LifecycleTransition } from './lifecycle';
import { Relationship } from './relationship';

export interface SBFPlugin {
  // Plugin identity
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  
  // Domain classification
  domain?: string;             // 'va', 'healthcare', 'legal', etc.
  category?: 'dashboard' | 'integration' | 'automation' | 'utility';
  
  // Plugin capabilities
  capabilities: PluginCapabilities;
  
  // Lifecycle hooks
  hooks: PluginHooks;
  
  // Entity extensions
  entityTypes?: EntityTemplate[];
  relationshipTypes?: string[];
  
  // UI extensions
  routes?: PluginRoute[];
  dashboardComponents?: DashboardComponent[];
  settingsComponent?: any;
  
  // Configuration
  config?: PluginConfig;
  
  // Dependencies
  dependencies?: string[];     // Other plugin IDs
  requiredVersion?: string;    // Minimum SBF version
}

export interface PluginCapabilities {
  providesEntities?: boolean;
  providesAutomation?: boolean;
  providesUI?: boolean;
  providesIntegration?: boolean;
  requiresAPI?: boolean;
  requiresDatabase?: boolean;
}

export interface PluginHooks {
  // Lifecycle hooks
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
  
  // Entity hooks
  onEntityCreate?: (entity: Entity) => Promise<void | Entity>;
  onEntityUpdate?: (entity: Entity, previous: Entity) => Promise<void | Entity>;
  onEntityDelete?: (entity: Entity) => Promise<void | boolean>;
  
  // Lifecycle transition hooks
  onLifecycleTransition?: (
    entity: Entity,
    from: LifecycleState,
    to: LifecycleState
  ) => Promise<void | boolean>;
  
  // Relationship hooks
  onRelationshipCreate?: (relationship: Relationship) => Promise<void | Relationship>;
  onRelationshipDelete?: (relationship: Relationship) => Promise<void | boolean>;
  
  // Query hooks (for custom filtering/sorting)
  onEntityQuery?: (query: any) => Promise<void | any>;
  
  // Custom event hooks
  onCustomEvent?: (event: PluginEvent) => Promise<void>;
}

export interface PluginRoute {
  path: string;
  component: any;
  exact?: boolean;
  requiresAuth?: boolean;
  title?: string;
  icon?: string;
}

export interface DashboardComponent {
  id: string;
  name: string;
  component: any;
  position?: 'header' | 'sidebar' | 'main' | 'footer';
  order?: number;
  width?: 'full' | 'half' | 'third' | 'quarter';
}

export interface PluginConfig {
  schema: Record<string, ConfigField>;
  defaults?: Record<string, any>;
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'json';
  label: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: (value: any) => boolean | string;
}

export interface PluginEvent {
  type: string;
  source: string;          // Plugin ID
  timestamp: string;       // ISO8601
  data?: Record<string, any>;
}

export interface PluginContext {
  pluginId: string;
  config: Record<string, any>;
  api: {
    entities: EntityAPI;
    lifecycle: LifecycleAPI;
    storage: StorageAPI;
    events: EventAPI;
  };
}

export interface EntityAPI {
  create: (entity: Partial<Entity>) => Promise<Entity>;
  get: (uid: string) => Promise<Entity | null>;
  update: (uid: string, updates: Partial<Entity>) => Promise<Entity>;
  delete: (uid: string) => Promise<boolean>;
  query: (query: any) => Promise<Entity[]>;
}

export interface LifecycleAPI {
  transition: (uid: string, to: LifecycleState) => Promise<LifecycleTransition>;
  getHistory: (uid: string) => Promise<LifecycleTransition[]>;
}

export interface StorageAPI {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  list: (prefix?: string) => Promise<string[]>;
}

export interface EventAPI {
  emit: (event: PluginEvent) => Promise<void>;
  on: (eventType: string, handler: (event: PluginEvent) => void) => void;
  off: (eventType: string, handler: (event: PluginEvent) => void) => void;
}

export interface PluginRegistry {
  plugins: Map<string, SBFPlugin>;
  enabled: Set<string>;
  
  register: (plugin: SBFPlugin) => Promise<void>;
  unregister: (pluginId: string) => Promise<void>;
  enable: (pluginId: string) => Promise<void>;
  disable: (pluginId: string) => Promise<void>;
  get: (pluginId: string) => SBFPlugin | undefined;
  getAll: () => SBFPlugin[];
  getEnabled: () => SBFPlugin[];
}
