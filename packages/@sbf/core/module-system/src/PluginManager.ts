/**
 * Plugin Manager
 * High-level API for managing plugins and executing hooks
 */

import { Entity, LifecycleState, Relationship, PluginEvent } from '@sbf/shared';
import { PluginRegistry } from './PluginRegistry';
import EventEmitter from 'eventemitter3';

export class PluginManager extends EventEmitter {
  constructor(private registry: PluginRegistry) {
    super();
  }
  
  // Entity lifecycle hooks
  async onEntityCreate(entity: Entity): Promise<Entity> {
    let currentEntity = entity;
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onEntityCreate) {
        const result = await plugin.hooks.onEntityCreate(currentEntity);
        if (result) {
          currentEntity = result;
        }
      }
    }
    
    return currentEntity;
  }
  
  async onEntityUpdate(entity: Entity, previous: Entity): Promise<Entity> {
    let currentEntity = entity;
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onEntityUpdate) {
        const result = await plugin.hooks.onEntityUpdate(currentEntity, previous);
        if (result) {
          currentEntity = result;
        }
      }
    }
    
    return currentEntity;
  }
  
  async onEntityDelete(entity: Entity): Promise<boolean> {
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onEntityDelete) {
        const result = await plugin.hooks.onEntityDelete(entity);
        if (result === false) {
          return false; // Plugin prevented deletion
        }
      }
    }
    
    return true; // Allow deletion
  }
  
  // Lifecycle transition hooks
  async onLifecycleTransition(
    entity: Entity,
    from: LifecycleState,
    to: LifecycleState
  ): Promise<boolean> {
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onLifecycleTransition) {
        const result = await plugin.hooks.onLifecycleTransition(entity, from, to);
        if (result === false) {
          return false; // Plugin prevented transition
        }
      }
    }
    
    return true; // Allow transition
  }
  
  // Relationship hooks
  async onRelationshipCreate(relationship: Relationship): Promise<Relationship> {
    let current = relationship;
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onRelationshipCreate) {
        const result = await plugin.hooks.onRelationshipCreate(current);
        if (result) {
          current = result;
        }
      }
    }
    
    return current;
  }
  
  async onRelationshipDelete(relationship: Relationship): Promise<boolean> {
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onRelationshipDelete) {
        const result = await plugin.hooks.onRelationshipDelete(relationship);
        if (result === false) {
          return false; // Plugin prevented deletion
        }
      }
    }
    
    return true; // Allow deletion
  }
  
  // Custom events
  async emitCustomEvent(event: PluginEvent): Promise<void> {
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onCustomEvent) {
        await plugin.hooks.onCustomEvent(event);
      }
    }
    
    this.emit('custom:event', event);
  }
  
  // Query hooks
  async onEntityQuery(query: any): Promise<any> {
    let currentQuery = query;
    
    for (const plugin of this.registry.getEnabled()) {
      if (plugin.hooks.onEntityQuery) {
        const result = await plugin.hooks.onEntityQuery(currentQuery);
        if (result) {
          currentQuery = result;
        }
      }
    }
    
    return currentQuery;
  }
}
