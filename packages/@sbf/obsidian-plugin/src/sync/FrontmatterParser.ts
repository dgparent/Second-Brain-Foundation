/**
 * FrontmatterParser - YAML Frontmatter Handling
 * 
 * Parses and serializes SBF-compatible frontmatter.
 * Per PRD FR6-FR9, FR18-FR19
 */

import { parseYaml, stringifyYaml } from 'obsidian';
import { SBFFrontmatter, BMOMFields, EntityRelationships, FOLDER_TO_TYPE } from '../types';
import { createHash } from 'crypto';

export class FrontmatterParser {
  private static readonly FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

  /**
   * Parse frontmatter from note content
   */
  parse(content: string): { frontmatter: SBFFrontmatter; body: string } {
    const match = content.match(FrontmatterParser.FRONTMATTER_REGEX);

    if (!match) {
      return { frontmatter: {}, body: content.trim() };
    }

    try {
      const frontmatter = parseYaml(match[1]) as SBFFrontmatter;
      const body = content.slice(match[0].length).trim();
      return { frontmatter: frontmatter || {}, body };
    } catch (error) {
      console.warn('Failed to parse frontmatter:', error);
      return { frontmatter: {}, body: content };
    }
  }

  /**
   * Serialize frontmatter back to string
   */
  serialize(frontmatter: SBFFrontmatter, body: string): string {
    // Filter out undefined/null values
    const cleaned = this.cleanFrontmatter(frontmatter);

    if (Object.keys(cleaned).length === 0) {
      return body;
    }

    const yaml = stringifyYaml(cleaned);
    return `---\n${yaml}---\n\n${body}`;
  }

  /**
   * Update frontmatter in note content
   */
  update(content: string, updates: Partial<SBFFrontmatter>): string {
    const { frontmatter, body } = this.parse(content);
    const updated = this.mergeFrontmatter(frontmatter, updates);
    return this.serialize(updated, body);
  }

  /**
   * Deep merge frontmatter with updates
   */
  private mergeFrontmatter(
    existing: SBFFrontmatter,
    updates: Partial<SBFFrontmatter>
  ): SBFFrontmatter {
    const merged = { ...existing };

    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Deep merge for objects
      if (key === 'bmom' && typeof value === 'object') {
        merged.bmom = { ...merged.bmom, ...value } as BMOMFields;
      } else if (key === 'relationships' && typeof value === 'object') {
        merged.relationships = {
          ...merged.relationships,
          ...value,
        } as EntityRelationships;
      } else if (key === 'sbf' && typeof value === 'object') {
        merged.sbf = { ...merged.sbf, ...value };
      } else {
        (merged as Record<string, unknown>)[key] = value;
      }
    }

    return merged;
  }

  /**
   * Remove undefined/null values from frontmatter
   */
  private cleanFrontmatter(fm: SBFFrontmatter): SBFFrontmatter {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(fm)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Clean nested objects
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = this.cleanObject(value as Record<string, unknown>);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else if (Array.isArray(value) && value.length > 0) {
        cleaned[key] = value;
      } else if (typeof value !== 'object') {
        cleaned[key] = value;
      }
    }

    return cleaned as SBFFrontmatter;
  }

  /**
   * Clean nested object
   */
  private cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
    const cleaned: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value) && value.length === 0) {
          continue;
        }
        cleaned[key] = value;
      }
    }

    return cleaned;
  }

  /**
   * Generate SBF UID from entity type and title
   * Format: {type}-{slug}-{counter}
   * Per PRD FR10
   */
  generateUid(type: string, title: string, counter?: number): string {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 30);

    const suffix = counter ? `-${counter}` : '';
    return `${type}-${slug}${suffix}`;
  }

  /**
   * Infer entity type from folder path
   */
  inferTypeFromPath(path: string): string | undefined {
    const folder = path.split('/')[0]?.toLowerCase();
    return FOLDER_TO_TYPE[folder];
  }

  /**
   * Calculate content checksum (SHA-256)
   * Per PRD FR24
   */
  calculateChecksum(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 16);
  }

  /**
   * Check if content has changed based on checksum
   */
  hasContentChanged(content: string, storedChecksum?: string): boolean {
    if (!storedChecksum) {
      return true;
    }
    return this.calculateChecksum(content) !== storedChecksum;
  }

  /**
   * Extract BMOM fields from content if not in frontmatter
   * Looks for ## Because, ## Meaning, ## Outcome, ## Measure sections
   */
  extractBMOMFromContent(content: string): BMOMFields {
    const bmom: BMOMFields = {};

    const sections = [
      { key: 'because', patterns: ['## Because', '## Why'] },
      { key: 'meaning', patterns: ['## Meaning', '## What'] },
      { key: 'outcome', patterns: ['## Outcome', '## Goal'] },
      { key: 'measure', patterns: ['## Measure', '## How'] },
    ];

    for (const section of sections) {
      for (const pattern of section.patterns) {
        const regex = new RegExp(
          `${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`,
          'i'
        );
        const match = content.match(regex);
        if (match && match[1]) {
          (bmom as Record<string, string>)[section.key] = match[1].trim();
          break;
        }
      }
    }

    return bmom;
  }

  /**
   * Extract tags from content (inline #tags)
   */
  extractTagsFromContent(content: string): string[] {
    const tagRegex = /#([a-zA-Z][a-zA-Z0-9_-]*)/g;
    const tags = new Set<string>();

    let match;
    while ((match = tagRegex.exec(content)) !== null) {
      tags.add(match[1]);
    }

    return Array.from(tags);
  }

  /**
   * Validate frontmatter structure
   */
  validate(frontmatter: SBFFrontmatter): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check UID format
    if (frontmatter.uid) {
      if (!/^[a-z]+-[a-z0-9-]+$/.test(frontmatter.uid)) {
        errors.push('Invalid UID format. Expected: {type}-{slug}');
      }
    }

    // Check sensitivity
    if (frontmatter.sensitivity) {
      const validLevels = ['public', 'personal', 'confidential', 'secret'];
      if (!validLevels.includes(frontmatter.sensitivity)) {
        errors.push(`Invalid sensitivity: ${frontmatter.sensitivity}`);
      }
    }

    // Check lifecycle
    if (frontmatter.lifecycle) {
      const validStates = ['fleeting', 'maturing', 'evergreen', 'archived'];
      if (!validStates.includes(frontmatter.lifecycle)) {
        errors.push(`Invalid lifecycle: ${frontmatter.lifecycle}`);
      }
    }

    // Check confidence
    if (frontmatter.confidence !== undefined) {
      if (frontmatter.confidence < 0 || frontmatter.confidence > 1) {
        errors.push('Confidence must be between 0.0 and 1.0');
      }
    }

    // Warnings for missing recommended fields
    if (!frontmatter.type) {
      warnings.push('Entity type not specified');
    }
    if (!frontmatter.title) {
      warnings.push('Title not specified');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Create minimal frontmatter for new entity
   */
  createMinimal(
    type: string,
    title: string,
    options: Partial<SBFFrontmatter> = {}
  ): SBFFrontmatter {
    const now = new Date().toISOString();

    return {
      uid: this.generateUid(type, title),
      type,
      title,
      created: now,
      modified: now,
      sensitivity: 'personal',
      ...options,
    };
  }
}

/**
 * Frontmatter validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
