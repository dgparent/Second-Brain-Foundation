/**
 * FrontmatterParser
 * 
 * Parses and generates YAML frontmatter in markdown files.
 * Handles PRD-compliant entity metadata including sensitivity and truth levels.
 */

import * as yaml from 'js-yaml';
import type { Frontmatter, TemplateData } from '../types';

export interface ParseResult {
  frontmatter: Frontmatter | null;
  body: string;
}

export class FrontmatterParser {
  private static FRONTMATTER_REGEX = /^---\r?\n([\s\S]*?)\r?\n---/;
  
  /**
   * Extract frontmatter from markdown content
   */
  parse(content: string): ParseResult {
    const match = content.match(FrontmatterParser.FRONTMATTER_REGEX);
    
    if (!match) {
      return { frontmatter: null, body: content };
    }
    
    try {
      const frontmatter = yaml.load(match[1]) as Frontmatter;
      const body = content.slice(match[0].length).trim();
      return { frontmatter, body };
    } catch (error) {
      console.error('Failed to parse frontmatter:', error);
      return { frontmatter: null, body: content };
    }
  }
  
  /**
   * Check if content has frontmatter
   */
  hasFrontmatter(content: string): boolean {
    return FrontmatterParser.FRONTMATTER_REGEX.test(content);
  }
  
  /**
   * Generate frontmatter YAML from data
   */
  generate(data: Partial<Frontmatter>): string {
    // Ensure arrays are properly formatted
    const cleanData = { ...data };
    if (!cleanData.relationships) {
      cleanData.relationships = [];
    }
    
    const frontmatter = yaml.dump(cleanData, {
      indent: 2,
      lineWidth: 120,
      quotingType: '"',
      noRefs: true,
      sortKeys: false,
    });
    
    return `---\n${frontmatter}---\n`;
  }
  
  /**
   * Update frontmatter in existing content
   */
  update(content: string, updates: Partial<Frontmatter>): string {
    const { frontmatter, body } = this.parse(content);
    
    const updated: Frontmatter = {
      ...frontmatter,
      ...updates,
      modified_at: new Date().toISOString(),
    } as Frontmatter;
    
    return this.generate(updated) + '\n' + body;
  }
  
  /**
   * Merge relationship into frontmatter
   */
  addRelationship(
    content: string,
    relationship: { target_uid: string; type: string; context?: string }
  ): string {
    const { frontmatter, body } = this.parse(content);
    
    if (!frontmatter) {
      throw new Error('Content has no frontmatter');
    }
    
    const relationships = frontmatter.relationships || [];
    
    // Check if relationship already exists
    const exists = relationships.some(
      r => r.target_uid === relationship.target_uid && r.type === relationship.type
    );
    
    if (!exists) {
      relationships.push(relationship);
    }
    
    return this.update(content, { relationships });
  }
  
  /**
   * Remove relationship from frontmatter
   */
  removeRelationship(content: string, targetUid: string, type: string): string {
    const { frontmatter, body } = this.parse(content);
    
    if (!frontmatter) {
      throw new Error('Content has no frontmatter');
    }
    
    const relationships = (frontmatter.relationships || []).filter(
      r => !(r.target_uid === targetUid && r.type === type)
    );
    
    return this.update(content, { relationships });
  }
  
  /**
   * Render template with data
   */
  renderTemplate(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = data[key];
      if (value === undefined || value === null) {
        return match; // Keep placeholder if no value
      }
      return String(value);
    });
  }
  
  /**
   * Create new content from entity type template
   */
  createFromTemplate(template: string, data: TemplateData): string {
    // Ensure required fields
    const fullData: TemplateData = {
      uid: data.uid,
      type: data.type,
      name: data.name,
      created_at: data.created_at || new Date().toISOString(),
      modified_at: data.modified_at || new Date().toISOString(),
      ...data,
    };
    
    return this.renderTemplate(template, fullData);
  }
  
  /**
   * Extract all keys from frontmatter
   */
  extractKeys(content: string): string[] {
    const { frontmatter } = this.parse(content);
    if (!frontmatter) return [];
    return Object.keys(frontmatter);
  }
  
  /**
   * Get specific frontmatter value
   */
  getValue<T = unknown>(content: string, key: string): T | undefined {
    const { frontmatter } = this.parse(content);
    if (!frontmatter) return undefined;
    return frontmatter[key] as T;
  }
  
  /**
   * Validate frontmatter has required fields
   */
  validateRequired(
    content: string,
    requiredFields: string[]
  ): { valid: boolean; missing: string[] } {
    const { frontmatter } = this.parse(content);
    
    if (!frontmatter) {
      return { valid: false, missing: requiredFields };
    }
    
    const missing = requiredFields.filter(
      field => frontmatter[field] === undefined || frontmatter[field] === null
    );
    
    return { valid: missing.length === 0, missing };
  }
  
  /**
   * Convert frontmatter to entity data
   */
  toEntityData(frontmatter: Frontmatter): {
    uid: string;
    typeSlug: string;
    name: string;
    sensitivity: Frontmatter['sensitivity'];
    truthLevel: Frontmatter['truth_level'];
    relationships: Frontmatter['relationships'];
  } {
    return {
      uid: frontmatter.uid,
      typeSlug: frontmatter.type,
      name: frontmatter.name,
      sensitivity: frontmatter.sensitivity,
      truthLevel: frontmatter.truth_level,
      relationships: frontmatter.relationships || [],
    };
  }
  
  /**
   * Create frontmatter from entity
   */
  fromEntity(entity: {
    uid: string;
    typeSlug: string;
    name: string;
    sensitivity: string;
    truthLevel: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Frontmatter {
    return {
      uid: entity.uid,
      type: entity.typeSlug,
      name: entity.name,
      created_at: entity.createdAt?.toISOString() || new Date().toISOString(),
      modified_at: entity.updatedAt?.toISOString() || new Date().toISOString(),
      relationships: [],
      sensitivity: entity.sensitivity as Frontmatter['sensitivity'],
      truth_level: entity.truthLevel as Frontmatter['truth_level'],
    };
  }
}
