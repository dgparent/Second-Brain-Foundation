/**
 * @sbf/memory-engine
 * Full knowledge layer for Second Brain Foundation
 */

// Main exports
export { MemoryEngine } from './MemoryEngine';
export { VaultAdapter } from './storage/VaultAdapter';
export { LifecycleEngine } from './lifecycle/LifecycleEngine';
export { ArangoDBAdapter } from './graph/ArangoDBAdapter';
export { computeAeiCode, parseAeiCode, canUseForAI, canExport } from './storage/AeiCodeComputer';

// Type exports
export type {
  // Core types
  Entity,
  EntityRelationship,
  
  // Memory & Lifecycle
  MemoryLevel,
  LifecycleState,
  LifecycleTransition,
  LifecycleRule,
  LifecycleEngineOptions,
  MemoryMetadata,
  
  // Security
  Sensitivity,
  SensitivityPrivacy,
  Control,
  RestrictionMode,
  ScopeGroup,
  Visibility,
  
  // Operations
  VaultOptions,
  VaultScanResult,
  OperationResult,
  
  // Graph
  GraphQuery,
  GraphQueryResult,
  
  // Search
  SearchQuery,
  SearchResult,
  
  // Events
  EntityEvent,
  EntityEventType,
  
  // Hooks
  MemoryEngineHooks,
  
  // Embedding & Vector
  EmbeddingProvider,
  VectorIndexEntry,
  
  // Sync
  SyncOptions,
  SyncConflict,
  ConflictResolutionStrategy
} from './types';
