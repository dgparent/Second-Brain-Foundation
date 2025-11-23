/**
 * Tool Manager
 * Manages tool registration and execution
 * 
 * Inspired by Letta's ToolManager
 */

import { Tool, ToolResult, validateToolParameters } from '../schemas/tool';

/**
 * Tool handler function type
 * Takes parameters and returns a promise of any result
 */
export type ToolHandler = (params: Record<string, any>) => Promise<any>;

/**
 * Registered tool with handler
 */
export interface RegisteredTool {
  tool: Tool;
  handler: ToolHandler;
}

/**
 * Tool Manager
 * 
 * Central registry for all tools available to agents.
 * Handles tool registration, lookup, validation, and execution.
 */
export class ToolManager {
  private tools: Map<string, RegisteredTool> = new Map();

  /**
   * Register a tool with its handler
   */
  registerTool(tool: Tool, handler: ToolHandler): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool ${tool.name} is already registered`);
    }

    this.tools.set(tool.name, { tool, handler });
    console.log(`Registered tool: ${tool.name}`);
  }

  /**
   * Unregister a tool
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name)?.tool;
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).map(rt => rt.tool);
  }

  /**
   * Get tools by tag
   */
  getToolsByTag(tag: string): Tool[] {
    return this.getAllTools().filter(tool => tool.tags.includes(tag));
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Validate tool call parameters
   */
  validateToolCall(name: string, params: Record<string, any>): { 
    valid: boolean; 
    errors: string[] 
  } {
    const registered = this.tools.get(name);
    
    if (!registered) {
      return {
        valid: false,
        errors: [`Tool ${name} not found`],
      };
    }

    return validateToolParameters(registered.tool, params);
  }

  /**
   * Execute a tool
   * 
   * Validates parameters, executes the tool handler, and returns
   * a standardized result.
   */
  async executeTool(
    name: string,
    params: Record<string, any>
  ): Promise<ToolResult> {
    const registered = this.tools.get(name);

    // Check if tool exists
    if (!registered) {
      return {
        success: false,
        error: `Tool not found: ${name}`,
      };
    }

    // Validate parameters
    const validation = validateToolParameters(registered.tool, params);
    if (!validation.valid) {
      return {
        success: false,
        error: `Parameter validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Execute tool handler
    try {
      const startTime = Date.now();
      const result = await registered.handler(params);
      const executionTime = Date.now() - startTime;

      // Check result size limit
      const resultStr = JSON.stringify(result);
      if (resultStr.length > registered.tool.return_char_limit) {
        console.warn(
          `Tool ${name} returned ${resultStr.length} characters, ` +
          `exceeding limit of ${registered.tool.return_char_limit}`
        );
        
        return {
          success: false,
          error: `Tool result exceeded character limit (${resultStr.length} > ${registered.tool.return_char_limit})`,
          metadata: {
            execution_time_ms: executionTime,
          },
        };
      }

      return {
        success: true,
        result,
        metadata: {
          execution_time_ms: executionTime,
        },
      };
    } catch (error) {
      console.error(`Tool execution error (${name}):`, error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Execute multiple tools in parallel
   * 
   * Note: Only use for tools that are safe to run concurrently
   */
  async executeToolsParallel(
    calls: Array<{ name: string; params: Record<string, any> }>
  ): Promise<ToolResult[]> {
    const promises = calls.map(call => 
      this.executeTool(call.name, call.params)
    );

    return Promise.all(promises);
  }

  /**
   * Get tool count
   */
  getToolCount(): number {
    return this.tools.size;
  }

  /**
   * Clear all tools
   */
  clear(): void {
    this.tools.clear();
  }
}
