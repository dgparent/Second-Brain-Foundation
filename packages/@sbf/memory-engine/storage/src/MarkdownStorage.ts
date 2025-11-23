/**
 * Markdown Storage
 * High-level storage interface for entities in markdown format
 */

import { EventEmitter } from 'events';
import { VaultAdapter } from './VaultAdapter';
import { VaultEntity, VaultEntityRaw, StorageOptions } from './types';
import { computeAeiCode } from './AeiCodeComputer';

export class MarkdownStorage extends EventEmitter {
  private adapter: VaultAdapter;
  private options: StorageOptions;

  constructor(options: StorageOptions) {
    super();
    this.options = {
      autoComputeAeiCode: true,
      emitEvents: true,
      ...options
    };
    this.adapter = new VaultAdapter(options.vaultRoot);
  }

  /**
   * Create a new entity
   */
  async createEntity(entity: VaultEntityRaw): Promise<VaultEntity> {
    // Compute AEI code if enabled
    const aei_code = this.options.autoComputeAeiCode
      ? computeAeiCode(entity.memory.memory_level, entity.sensitivity, entity.control)
      : '';

    const fullEntity: VaultEntity = {
      ...entity,
      aei_code
    };

    // Save to vault
    this.adapter.saveEntity(entity);

    // Emit event
    if (this.options.emitEvents) {
      this.emit('entity:created', fullEntity);
    }

    return fullEntity;
  }

  /**
   * Get entity by vault path
   */
  async getEntity(vault_path: string): Promise<VaultEntity | null> {
    return this.adapter.loadEntity(vault_path);
  }

  /**
   * Update entity
   */
  async updateEntity(vault_path: string, updates: Partial<VaultEntityRaw>): Promise<VaultEntity | null> {
    const existing = this.adapter.loadEntity(vault_path);
    
    if (!existing) {
      return null;
    }

    const updated: VaultEntityRaw = {
      ...existing,
      ...updates,
      memory: { ...existing.memory, ...updates.memory },
      sensitivity: { ...existing.sensitivity, ...updates.sensitivity }
    };

    // Recompute AEI code
    const aei_code = this.options.autoComputeAeiCode
      ? computeAeiCode(updated.memory.memory_level, updated.sensitivity, updated.control)
      : existing.aei_code;

    const fullEntity: VaultEntity = {
      ...updated,
      aei_code
    };

    // Save to vault
    this.adapter.saveEntity(updated);

    // Emit event
    if (this.options.emitEvents) {
      this.emit('entity:updated', fullEntity);
    }

    return fullEntity;
  }

  /**
   * Delete entity
   */
  async deleteEntity(vault_path: string): Promise<boolean> {
    const existing = this.adapter.loadEntity(vault_path);
    
    if (!existing) {
      return false;
    }

    const result = this.adapter.deleteEntity(vault_path);

    if (result && this.options.emitEvents) {
      this.emit('entity:deleted', existing);
    }

    return result;
  }

  /**
   * Query entities (simple implementation)
   */
  async queryEntities(filter?: {
    memory_level?: string;
    sensitivity_level_min?: number;
    sensitivity_level_max?: number;
  }): Promise<VaultEntity[]> {
    const all = this.adapter.scanVault();

    if (!filter) {
      return all;
    }

    return all.filter(entity => {
      if (filter.memory_level && entity.memory.memory_level !== filter.memory_level) {
        return false;
      }

      if (filter.sensitivity_level_min !== undefined && entity.sensitivity.level < filter.sensitivity_level_min) {
        return false;
      }

      if (filter.sensitivity_level_max !== undefined && entity.sensitivity.level > filter.sensitivity_level_max) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get all entities
   */
  async getAllEntities(): Promise<VaultEntity[]> {
    return this.adapter.scanVault();
  }

  /**
   * Update AEI code for entity (recalculate)
   */
  async updateAeiCode(vault_path: string): Promise<VaultEntity | null> {
    const entity = this.adapter.loadEntity(vault_path);
    
    if (!entity) {
      return null;
    }

    const new_aei_code = computeAeiCode(
      entity.memory.memory_level,
      entity.sensitivity,
      entity.control
    );

    // Only update if changed
    if (new_aei_code !== entity.aei_code) {
      entity.aei_code = new_aei_code;
      this.adapter.saveEntity(entity);

      if (this.options.emitEvents) {
        this.emit('entity:aei_code_updated', entity);
      }
    }

    return entity;
  }
}
