/**
 * Output parser for transformation results.
 * 
 * Parses and validates LLM outputs based on expected format.
 */

import Ajv from 'ajv';
import { OutputFormat, ValidationResult } from '../types';

/**
 * Output parser configuration.
 */
export interface OutputParserConfig {
  /** Enable strict JSON parsing */
  strictJson?: boolean;
  
  /** Maximum retries for JSON extraction */
  maxJsonRetries?: number;
}

/**
 * Output parser service.
 */
export class OutputParser {
  private ajv: Ajv;
  private config: Required<OutputParserConfig>;
  
  constructor(config: OutputParserConfig = {}) {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    this.config = {
      strictJson: config.strictJson ?? false,
      maxJsonRetries: config.maxJsonRetries ?? 3,
    };
  }
  
  /**
   * Parse output based on format.
   */
  parse(
    content: string,
    format: OutputFormat,
    schema?: Record<string, unknown>
  ): { content: string; parsed?: unknown; valid: boolean; errors?: string[] } {
    switch (format) {
      case 'markdown':
        return this.parseMarkdown(content);
      case 'json':
        return this.parseJson(content, schema);
      case 'structured':
        return this.parseStructured(content, schema);
      default:
        return { content, valid: true };
    }
  }
  
  /**
   * Parse markdown output.
   */
  private parseMarkdown(content: string): { content: string; valid: boolean } {
    // Clean up common LLM artifacts
    let cleaned = content
      .replace(/^```markdown\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();
    
    // Remove any thinking tags if present
    cleaned = this.removeThinkingTags(cleaned);
    
    return { content: cleaned, valid: true };
  }
  
  /**
   * Parse JSON output.
   */
  private parseJson(
    content: string,
    schema?: Record<string, unknown>
  ): { content: string; parsed?: unknown; valid: boolean; errors?: string[] } {
    // Try to extract JSON from content
    const jsonString = this.extractJson(content);
    
    if (!jsonString) {
      return {
        content,
        valid: false,
        errors: ['No valid JSON found in output'],
      };
    }
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate against schema if provided
      if (schema) {
        const validation = this.validateSchema(parsed, schema);
        if (!validation.valid) {
          return {
            content: jsonString,
            parsed,
            valid: false,
            errors: validation.errors,
          };
        }
      }
      
      return {
        content: JSON.stringify(parsed, null, 2),
        parsed,
        valid: true,
      };
    } catch (error) {
      return {
        content,
        valid: false,
        errors: [`JSON parse error: ${error instanceof Error ? error.message : 'Unknown'}`],
      };
    }
  }
  
  /**
   * Parse structured output (with validation).
   */
  private parseStructured(
    content: string,
    schema?: Record<string, unknown>
  ): { content: string; parsed?: unknown; valid: boolean; errors?: string[] } {
    // For structured, we require a schema
    if (!schema) {
      return this.parseJson(content);
    }
    
    return this.parseJson(content, schema);
  }
  
  /**
   * Extract JSON from LLM output.
   */
  private extractJson(content: string): string | null {
    // Remove thinking tags first
    content = this.removeThinkingTags(content);
    
    // Try to find JSON in code blocks
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      const candidate = codeBlockMatch[1].trim();
      if (this.isValidJson(candidate)) {
        return candidate;
      }
    }
    
    // Try to find JSON object first (more common for structured output)
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch && this.isValidJson(objectMatch[0])) {
      return objectMatch[0];
    }
    
    // Try to find JSON array
    const arrayMatch = content.match(/\[[\s\S]*\]/);
    if (arrayMatch && this.isValidJson(arrayMatch[0])) {
      return arrayMatch[0];
    }
    
    // Last resort: try the whole content
    if (this.isValidJson(content.trim())) {
      return content.trim();
    }
    
    return null;
  }
  
  /**
   * Check if string is valid JSON.
   */
  private isValidJson(str: string): boolean {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Remove thinking/reasoning tags from output.
   */
  private removeThinkingTags(content: string): string {
    return content
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
      .trim();
  }
  
  /**
   * Validate data against JSON schema.
   */
  validateSchema(data: unknown, schema: Record<string, unknown>): ValidationResult {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid && validate.errors) {
      const errors = validate.errors.map(err => 
        `${err.instancePath || '/'}: ${err.message}`
      );
      return { valid: false, errors, data };
    }
    
    return { valid: true, data };
  }
  
  /**
   * Try to repair malformed JSON.
   */
  repairJson(content: string): string | null {
    // Common repairs
    let repaired = content
      // Remove trailing commas
      .replace(/,\s*([\]}])/g, '$1')
      // Add missing quotes to keys
      .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')
      // Fix single quotes to double quotes
      .replace(/'/g, '"');
    
    if (this.isValidJson(repaired)) {
      return repaired;
    }
    
    return null;
  }
  
  /**
   * Extract specific fields from parsed JSON.
   */
  extractFields(
    data: unknown,
    fields: string[]
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    if (typeof data !== 'object' || data === null) {
      return result;
    }
    
    for (const field of fields) {
      const value = this.getNestedValue(data as Record<string, unknown>, field);
      if (value !== undefined) {
        result[field] = value;
      }
    }
    
    return result;
  }
  
  /**
   * Get nested value from object using dot notation.
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const parts = path.split('.');
    let current: unknown = obj;
    
    for (const part of parts) {
      if (current === null || typeof current !== 'object') {
        return undefined;
      }
      current = (current as Record<string, unknown>)[part];
    }
    
    return current;
  }
}

/**
 * Create a default output parser.
 */
export function createOutputParser(config?: OutputParserConfig): OutputParser {
  return new OutputParser(config);
}
