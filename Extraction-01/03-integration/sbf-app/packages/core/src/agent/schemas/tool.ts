/**
 * Tool Schema - Tool Definition and Validation
 * Inspired by Letta's tool system
 * 
 * Defines the structure for tools that agents can execute.
 */

import { z } from 'zod';

/**
 * Tool parameter types
 */
export type ToolParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

/**
 * Tool Parameter Schema
 * Defines a single parameter for a tool
 */
export const ToolParameterSchema = z.object({
  type: z.enum(['string', 'number', 'boolean', 'object', 'array']),
  description: z.string(),
  required: z.boolean().default(false),
  enum: z.array(z.string()).optional(),
  default: z.any().optional(),
  properties: z.record(z.any()).optional(), // For object types
  items: z.any().optional(), // For array types
});

export type ToolParameter = z.infer<typeof ToolParameterSchema>;

/**
 * Tool Schema
 * Defines a complete tool that can be called by the agent
 */
export const ToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  parameters: z.record(ToolParameterSchema),
  return_char_limit: z.number().min(1).max(1_000_000).default(3000),
  tags: z.array(z.string()).default([]),
});

export type Tool = z.infer<typeof ToolSchema>;

/**
 * Tool execution result
 */
export const ToolResultSchema = z.object({
  success: z.boolean(),
  result: z.any().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ToolResult = z.infer<typeof ToolResultSchema>;

/**
 * Convert tool to OpenAI function calling format
 * 
 * Transforms our tool schema into OpenAI's function calling format
 * for use with the chat completions API.
 */
export function toolToOpenAIFunction(tool: Tool) {
  // Build properties object
  const properties: Record<string, any> = {};
  const required: string[] = [];

  for (const [paramName, param] of Object.entries(tool.parameters)) {
    properties[paramName] = {
      type: param.type,
      description: param.description,
    };

    if (param.enum) {
      properties[paramName].enum = param.enum;
    }

    if (param.properties) {
      properties[paramName].properties = param.properties;
    }

    if (param.items) {
      properties[paramName].items = param.items;
    }

    if (param.required) {
      required.push(paramName);
    }
  }

  return {
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties,
        required,
      },
    },
  };
}

/**
 * Validate tool call parameters
 * 
 * Validates that the parameters provided in a tool call match
 * the tool's parameter schema.
 */
export function validateToolParameters(
  tool: Tool,
  params: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required parameters
  for (const [paramName, param] of Object.entries(tool.parameters)) {
    if (param.required && !(paramName in params)) {
      errors.push(`Missing required parameter: ${paramName}`);
    }
  }

  // Check parameter types
  for (const [paramName, value] of Object.entries(params)) {
    const param = tool.parameters[paramName];
    
    if (!param) {
      errors.push(`Unknown parameter: ${paramName}`);
      continue;
    }

    const actualType = Array.isArray(value) 
      ? 'array' 
      : typeof value === 'object' && value !== null
      ? 'object'
      : typeof value;

    if (actualType !== param.type) {
      errors.push(`Parameter ${paramName} expected ${param.type}, got ${actualType}`);
    }

    // Check enum values
    if (param.enum && !param.enum.includes(String(value))) {
      errors.push(`Parameter ${paramName} must be one of: ${param.enum.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create a tool definition
 * 
 * Helper function to create a tool with type safety
 */
export function createTool(
  name: string,
  description: string,
  parameters: Record<string, Omit<ToolParameter, 'type'> & { type: ToolParameterType }>,
  options?: {
    returnCharLimit?: number;
    tags?: string[];
  }
): Tool {
  return {
    id: `tool-${name}`,
    name,
    description,
    parameters,
    return_char_limit: options?.returnCharLimit ?? 3000,
    tags: options?.tags ?? [],
  };
}
