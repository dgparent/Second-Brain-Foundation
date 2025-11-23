/**
 * Memory System - Block-based Memory
 * Inspired by Letta's memory architecture
 * 
 * Implements a flexible block-based memory system where each block
 * represents a specific type of information (persona, user, context, etc.)
 */

import { z } from 'zod';

/**
 * Memory Block Schema
 * 
 * Each block has:
 * - id: Unique identifier
 * - label: Human-readable name
 * - value: The actual content
 * - limit: Character limit for the block
 * - is_template: Whether this is a template block
 * - read_only: Whether this block can be modified (Letta parity)
 */
export const BlockSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  limit: z.number().default(2000),
  is_template: z.boolean().default(false),
  read_only: z.boolean().default(false),
});

export type Block = z.infer<typeof BlockSchema>;

/**
 * Abstract Memory base class
 * 
 * All memory implementations must extend this class.
 */
export abstract class Memory {
  /**
   * Get all memory blocks
   */
  abstract getBlocks(): Block[];

  /**
   * Update a specific memory block by label
   */
  abstract updateBlock(label: string, value: string): void;

  /**
   * Serialize memory to JSON
   */
  abstract toJSON(): Record<string, any>;

  /**
   * Deserialize memory from JSON
   */
  abstract fromJSON(data: Record<string, any>): void;

  /**
   * Get memory as a formatted string for LLM context
   */
  toContextString(): string {
    const blocks = this.getBlocks();
    return blocks
      .map(block => `### ${block.label}\n${block.value}`)
      .join('\n\n');
  }
}

/**
 * Chat Memory - Basic two-block memory
 * 
 * Implements Letta's ChatMemory pattern with:
 * - Persona block: Agent's personality and role
 * - Human block: User context and preferences
 */
export class ChatMemory extends Memory {
  protected persona: Block;
  protected user: Block;

  constructor(personaValue: string, userValue: string) {
    super();
    this.persona = {
      id: 'persona-core',
      label: 'persona',
      value: personaValue,
      limit: 2000,
      is_template: false,
    };
    this.user = {
      id: 'user-core',
      label: 'human',
      value: userValue,
      limit: 2000,
      is_template: false,
    };
  }

  getBlocks(): Block[] {
    return [this.persona, this.user];
  }

  updateBlock(label: string, value: string): void {
    if (label === 'persona') {
      this.persona.value = value;
    } else if (label === 'human') {
      this.user.value = value;
    } else {
      throw new Error(`Unknown block label: ${label}`);
    }
  }

  getPersona(): string {
    return this.persona.value;
  }

  getUser(): string {
    return this.user.value;
  }

  toJSON(): Record<string, any> {
    return {
      type: 'ChatMemory',
      blocks: this.getBlocks(),
    };
  }

  fromJSON(data: Record<string, any>): void {
    const blocks = data.blocks as Block[];
    blocks.forEach(block => {
      if (block.label === 'persona') {
        this.persona = block;
      } else if (block.label === 'human') {
        this.user = block;
      }
    });
  }
}

/**
 * SBF Memory - Extended memory for Second Brain Foundation
 * 
 * Adds SBF-specific context blocks:
 * - current_focus: Currently focused entity
 * - recent_entities: Recently accessed entities
 * - active_projects: Active project entities
 */
export class SBFMemory extends ChatMemory {
  private currentFocus: Block;
  private recentEntities: Block;
  private activeProjects: Block;

  constructor(personaValue: string, userValue: string) {
    super(personaValue, userValue);
    
    this.currentFocus = {
      id: 'current-focus',
      label: 'current_focus',
      value: 'No current focus',
      limit: 1000,
      is_template: false,
    };
    
    this.recentEntities = {
      id: 'recent-entities',
      label: 'recent_entities',
      value: '[]',
      limit: 1000,
      is_template: false,
    };

    this.activeProjects = {
      id: 'active-projects',
      label: 'active_projects',
      value: '[]',
      limit: 1000,
      is_template: false,
    };
  }

  getBlocks(): Block[] {
    return [
      ...super.getBlocks(),
      this.currentFocus,
      this.recentEntities,
      this.activeProjects,
    ];
  }

  /**
   * Set the current focus entity
   */
  setCurrentFocus(entityUid: string, entityTitle: string): void {
    this.currentFocus.value = `Currently focused on: ${entityTitle} (${entityUid})`;
  }

  /**
   * Clear the current focus
   */
  clearCurrentFocus(): void {
    this.currentFocus.value = 'No current focus';
  }

  /**
   * Add an entity to recent entities list
   */
  addRecentEntity(entityUid: string): void {
    const recent = JSON.parse(this.recentEntities.value) as string[];
    if (!recent.includes(entityUid)) {
      recent.unshift(entityUid);
      if (recent.length > 10) recent.pop();
      this.recentEntities.value = JSON.stringify(recent);
    }
  }

  /**
   * Get recent entities
   */
  getRecentEntities(): string[] {
    return JSON.parse(this.recentEntities.value) as string[];
  }

  /**
   * Set active projects
   */
  setActiveProjects(projectUids: string[]): void {
    this.activeProjects.value = JSON.stringify(projectUids);
  }

  /**
   * Get active projects
   */
  getActiveProjects(): string[] {
    return JSON.parse(this.activeProjects.value) as string[];
  }

  updateBlock(label: string, value: string): void {
    switch (label) {
      case 'current_focus':
        this.currentFocus.value = value;
        break;
      case 'recent_entities':
        this.recentEntities.value = value;
        break;
      case 'active_projects':
        this.activeProjects.value = value;
        break;
      default:
        super.updateBlock(label, value);
    }
  }

  toJSON(): Record<string, any> {
    return {
      type: 'SBFMemory',
      blocks: this.getBlocks(),
    };
  }

  fromJSON(data: Record<string, any>): void {
    super.fromJSON(data);
    const blocks = data.blocks as Block[];
    blocks.forEach(block => {
      switch (block.label) {
        case 'current_focus':
          this.currentFocus = block;
          break;
        case 'recent_entities':
          this.recentEntities = block;
          break;
        case 'active_projects':
          this.activeProjects = block;
          break;
      }
    });
  }
}
