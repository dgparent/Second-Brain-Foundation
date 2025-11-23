/**
 * Memory Module Exports
 * Core, Archival, and Recall memory systems
 */

// Placeholder for memory implementations
// Will be filled during Letta analysis and refactoring

export interface CoreMemoryInterface {
  update(field: string, value: string): Promise<void>;
  get(field: string): Promise<string | undefined>;
}

export interface ArchivalMemoryInterface {
  search(query: string): Promise<any[]>;
  insert(data: any): Promise<void>;
}

export interface RecallMemoryInterface {
  add(message: any): Promise<void>;
  getRecent(count: number): Promise<any[]>;
}
