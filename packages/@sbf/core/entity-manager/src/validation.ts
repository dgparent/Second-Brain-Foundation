import { CreateEntityInput, UpdateEntityInput, CreateTaskInput, UpdateTaskInput } from './types';

export class ValidationError extends Error {
  constructor(
    public errors: string[],
    message: string = 'Validation failed'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class EntityValidator {
  static validateCreate(input: CreateEntityInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.name || input.name.trim().length === 0) {
      errors.push('Entity name is required');
    }

    if (!input.entity_type || input.entity_type.trim().length === 0) {
      errors.push('Entity type is required');
    }

    const validTypes = ['person', 'project', 'place', 'event', 'task', 'note', 'document'];
    if (input.entity_type && !validTypes.includes(input.entity_type)) {
      errors.push(`Invalid entity type. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(input: UpdateEntityInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.name !== undefined && input.name.trim().length === 0) {
      errors.push('Entity name cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export class TaskValidator {
  static validateCreate(input: CreateTaskInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!input.title || input.title.trim().length === 0) {
      errors.push('Task title is required');
    }

    if (input.title && input.title.length > 500) {
      errors.push('Task title cannot exceed 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateUpdate(input: UpdateTaskInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.title !== undefined && input.title.trim().length === 0) {
      errors.push('Task title cannot be empty');
    }

    if (input.title && input.title.length > 500) {
      errors.push('Task title cannot exceed 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export class SyncConflictResolver {
  resolve(local: any, remote: any): { shouldAccept: boolean; hadConflict: boolean; resolution?: string; reason?: string } {
    // Simplified resolution logic
    return {
      shouldAccept: true,
      hadConflict: false,
      resolution: 'remote-wins'
    };
  }
}
