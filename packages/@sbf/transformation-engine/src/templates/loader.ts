/**
 * Template loader for built-in transformation templates.
 * 
 * Loads YAML templates and converts them to Transformation objects.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { 
  Transformation, 
  createTransformation 
} from '../models/Transformation';
import { OutputFormat } from '../types';

/**
 * Raw template from YAML file.
 */
interface RawTemplate {
  name: string;
  description: string;
  outputFormat: string;
  modelId?: string;
  temperature?: number;
  maxTokens?: number;
  applicableIngestionTypes?: string[];
  promptTemplate: string;
  outputSchema?: Record<string, unknown> | null;
  tags?: string[];
}

/**
 * Load a single template from YAML file.
 */
export function loadTemplateFromFile(filePath: string): Transformation {
  const content = fs.readFileSync(filePath, 'utf-8');
  const raw = yaml.load(content) as RawTemplate;
  
  return createTransformation({
    tenantId: null, // System default
    name: raw.name,
    description: raw.description,
    promptTemplate: raw.promptTemplate,
    outputFormat: raw.outputFormat as OutputFormat,
    outputSchema: raw.outputSchema ?? undefined,
    modelId: raw.modelId,
    temperature: raw.temperature,
    maxTokens: raw.maxTokens,
    applicableIngestionTypes: raw.applicableIngestionTypes ?? [],
  });
}

/**
 * Load all templates from a directory.
 */
export function loadTemplatesFromDirectory(dirPath: string): Transformation[] {
  const templates: Transformation[] = [];
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    if (file.endsWith('.yaml') || file.endsWith('.yml')) {
      const filePath = path.join(dirPath, file);
      try {
        templates.push(loadTemplateFromFile(filePath));
      } catch (error) {
        console.error(`Failed to load template ${file}:`, error);
      }
    }
  }
  
  return templates;
}

/**
 * Get the path to built-in templates.
 */
export function getBuiltInTemplatesPath(): string {
  return path.join(__dirname, 'templates');
}

/**
 * Load all built-in templates.
 */
export function loadBuiltInTemplates(): Transformation[] {
  const templatesPath = getBuiltInTemplatesPath();
  
  if (!fs.existsSync(templatesPath)) {
    console.warn('Built-in templates directory not found:', templatesPath);
    return [];
  }
  
  return loadTemplatesFromDirectory(templatesPath);
}

/**
 * Get a specific built-in template by name.
 */
export function getBuiltInTemplate(name: string): Transformation | undefined {
  const templates = loadBuiltInTemplates();
  return templates.find(t => t.name === name);
}

/**
 * List available built-in template names.
 */
export function listBuiltInTemplateNames(): string[] {
  const templates = loadBuiltInTemplates();
  return templates.map(t => t.name);
}

/**
 * Validate a template YAML file.
 */
export function validateTemplateFile(filePath: string): { 
  valid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const raw = yaml.load(content) as RawTemplate;
    
    // Required fields
    if (!raw.name) errors.push('Missing required field: name');
    if (!raw.description) errors.push('Missing required field: description');
    if (!raw.promptTemplate) errors.push('Missing required field: promptTemplate');
    if (!raw.outputFormat) errors.push('Missing required field: outputFormat');
    
    // Output format validation
    const validFormats = ['markdown', 'json', 'structured'];
    if (raw.outputFormat && !validFormats.includes(raw.outputFormat)) {
      errors.push(`Invalid outputFormat: ${raw.outputFormat}. Must be one of: ${validFormats.join(', ')}`);
    }
    
    // Temperature validation
    if (raw.temperature !== undefined) {
      if (raw.temperature < 0 || raw.temperature > 2) {
        errors.push('Temperature must be between 0 and 2');
      }
    }
    
    // Max tokens validation
    if (raw.maxTokens !== undefined) {
      if (raw.maxTokens < 1 || raw.maxTokens > 128000) {
        errors.push('maxTokens must be between 1 and 128000');
      }
    }
    
    // Schema required for structured output
    if (raw.outputFormat === 'structured' && !raw.outputSchema) {
      errors.push('outputSchema is required for structured outputFormat');
    }
    
  } catch (error) {
    errors.push(`Failed to parse YAML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
