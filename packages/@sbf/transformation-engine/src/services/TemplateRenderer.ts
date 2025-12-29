/**
 * Template renderer using Nunjucks (Jinja2-compatible).
 * 
 * Renders transformation templates with source content.
 */

import nunjucks from 'nunjucks';
import { TransformationContext } from '../types';

/**
 * Custom filters for templates.
 */
const CUSTOM_FILTERS = {
  /**
   * Truncate text to a maximum length.
   */
  truncate: (str: string | undefined, length: number, end: string = '...'): string => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - end.length) + end;
  },
  
  /**
   * Count words in text.
   */
  wordcount: (str: string | undefined): number => {
    if (!str) return 0;
    return str.split(/\s+/).filter(w => w.length > 0).length;
  },
  
  /**
   * Estimate token count (rough heuristic).
   */
  tokencount: (str: string | undefined): number => {
    if (!str) return 0;
    // Rough estimation: ~4 characters per token
    return Math.ceil(str.length / 4);
  },
  
  /**
   * Extract first N sentences.
   */
  firstsentences: (str: string | undefined, count: number = 3): string => {
    if (!str) return '';
    const sentences = str.match(/[^.!?]+[.!?]+/g) ?? [];
    return sentences.slice(0, count).join(' ').trim();
  },
  
  /**
   * Clean text for prompt (remove excess whitespace).
   */
  cleantext: (str: string | undefined): string => {
    if (!str) return '';
    return str
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  },
  
  /**
   * Format as list items.
   */
  aslist: (arr: unknown[] | undefined, prefix: string = '- '): string => {
    if (!arr || !Array.isArray(arr)) return '';
    return arr.map(item => `${prefix}${item}`).join('\n');
  },
  
  /**
   * Format date.
   */
  formatdate: (date: string | Date | undefined, format: string = 'short'): string => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      case 'iso':
        return d.toISOString().split('T')[0];
      default:
        return d.toLocaleDateString();
    }
  },
  
  /**
   * JSON stringify.
   */
  tojson: (obj: unknown, indent: number = 2): string => {
    return JSON.stringify(obj, null, indent);
  },
};

/**
 * Allowed globals in templates (sandboxing).
 */
const ALLOWED_GLOBALS = {
  now: () => new Date().toISOString(),
  today: () => new Date().toISOString().split('T')[0],
};

/**
 * Template renderer configuration.
 */
export interface TemplateRendererConfig {
  /** Enable strict mode (throw on undefined) */
  strict?: boolean;
  
  /** Auto-escape HTML */
  autoEscape?: boolean;
  
  /** Custom filters to add */
  customFilters?: Record<string, (...args: unknown[]) => unknown>;
}

/**
 * Template rendering result.
 */
export interface RenderResult {
  /** Rendered template */
  content: string;
  
  /** Estimated token count */
  estimatedTokens: number;
  
  /** Whether any variables were undefined */
  hadUndefined?: boolean;
}

/**
 * Template renderer service.
 */
export class TemplateRenderer {
  private env: nunjucks.Environment;
  
  constructor(config: TemplateRendererConfig = {}) {
    // Create environment with no file system loader (security)
    this.env = new nunjucks.Environment(null, {
      autoescape: config.autoEscape ?? false,
      throwOnUndefined: config.strict ?? false,
    });
    
    // Add custom filters
    for (const [name, fn] of Object.entries(CUSTOM_FILTERS)) {
      this.env.addFilter(name, fn);
    }
    
    // Add user custom filters
    if (config.customFilters) {
      for (const [name, fn] of Object.entries(config.customFilters)) {
        this.env.addFilter(name, fn);
      }
    }
    
    // Add allowed globals
    for (const [name, fn] of Object.entries(ALLOWED_GLOBALS)) {
      this.env.addGlobal(name, fn);
    }
  }
  
  /**
   * Render a template with context.
   */
  render(template: string, context: TransformationContext): RenderResult {
    const content = this.env.renderString(template, context);
    
    return {
      content,
      estimatedTokens: Math.ceil(content.length / 4),
    };
  }
  
  /**
   * Render a template string directly.
   */
  renderString(template: string, data: Record<string, unknown>): string {
    return this.env.renderString(template, data);
  }
  
  /**
   * Validate a template (check for syntax errors).
   */
  validate(template: string): { valid: boolean; error?: string } {
    try {
      // Compile and render to check syntax (renderString catches more errors than compile)
      this.env.renderString(template, {});
      return { valid: true };
    } catch (error) {
      // Check if error is due to undefined variables (which is OK)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('attempted to output null or undefined value')) {
        // This is fine - the template is valid, just has undefined vars
        return { valid: true };
      }
      return {
        valid: false,
        error: errorMsg,
      };
    }
  }
  
  /**
   * Extract variables used in a template.
   */
  extractVariables(template: string): string[] {
    const variables = new Set<string>();
    
    // Match {{ variable }} patterns
    const varPattern = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_\.]*)/g;
    let match;
    
    while ((match = varPattern.exec(template)) !== null) {
      // Get root variable (before first dot)
      const rootVar = match[1].split('.')[0];
      variables.add(rootVar);
    }
    
    // Match {% for x in variable %} patterns
    const forPattern = /\{%\s*for\s+\w+\s+in\s+([a-zA-Z_][a-zA-Z0-9_\.]*)/g;
    
    while ((match = forPattern.exec(template)) !== null) {
      const rootVar = match[1].split('.')[0];
      variables.add(rootVar);
    }
    
    // Match {% if variable %} patterns
    const ifPattern = /\{%\s*if\s+([a-zA-Z_][a-zA-Z0-9_\.]*)/g;
    
    while ((match = ifPattern.exec(template)) !== null) {
      const rootVar = match[1].split('.')[0];
      variables.add(rootVar);
    }
    
    return Array.from(variables);
  }
  
  /**
   * Add a custom filter.
   */
  addFilter(name: string, fn: (...args: unknown[]) => unknown): void {
    this.env.addFilter(name, fn);
  }
  
  /**
   * Add a global function/value.
   */
  addGlobal(name: string, value: unknown): void {
    this.env.addGlobal(name, value);
  }
}

/**
 * Create a default template renderer.
 */
export function createTemplateRenderer(
  config?: TemplateRendererConfig
): TemplateRenderer {
  return new TemplateRenderer(config);
}
