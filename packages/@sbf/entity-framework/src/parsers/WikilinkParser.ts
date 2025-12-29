/**
 * WikilinkParser
 * 
 * Extracts and resolves [[UID]] style wikilinks from content.
 * Supports optional display text with [[UID|Display Text]] syntax.
 */

import type { WikiLink } from '../types';

export type WikiLinkResolver = (uid: string) => string | null;

export class WikilinkParser {
  private static WIKILINK_REGEX = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  private static SINGLE_WIKILINK_REGEX = /^\[\[([^\]|]+)(?:\|([^\]]+))?\]\]$/;
  
  /**
   * Extract all wikilinks from content
   */
  extract(content: string): WikiLink[] {
    const links: WikiLink[] = [];
    let match: RegExpExecArray | null;
    
    // Reset regex state
    const regex = new RegExp(WikilinkParser.WIKILINK_REGEX.source, 'g');
    
    while ((match = regex.exec(content)) !== null) {
      links.push({
        uid: match[1].trim(),
        displayText: match[2]?.trim(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    return links;
  }
  
  /**
   * Extract unique UIDs from content
   */
  extractUIDs(content: string): string[] {
    const links = this.extract(content);
    const uids = new Set(links.map(link => link.uid));
    return Array.from(uids);
  }
  
  /**
   * Count wikilinks in content
   */
  count(content: string): number {
    const matches = content.match(WikilinkParser.WIKILINK_REGEX);
    return matches?.length || 0;
  }
  
  /**
   * Replace wikilinks with resolved content
   */
  resolve(content: string, resolver: WikiLinkResolver): string {
    return content.replace(
      WikilinkParser.WIKILINK_REGEX,
      (match, uid, displayText) => {
        const resolved = resolver(uid.trim());
        if (resolved === null) {
          return match; // Keep original if not resolved
        }
        return displayText?.trim() || resolved;
      }
    );
  }
  
  /**
   * Replace wikilinks with custom formatter
   */
  transform(
    content: string,
    transformer: (link: WikiLink, raw: string) => string
  ): string {
    const links = this.extract(content);
    
    // Process in reverse order to maintain positions
    let result = content;
    for (let i = links.length - 1; i >= 0; i--) {
      const link = links[i];
      const raw = content.substring(link.start, link.end);
      const replacement = transformer(link, raw);
      result = result.substring(0, link.start) + replacement + result.substring(link.end);
    }
    
    return result;
  }
  
  /**
   * Create a wikilink string
   */
  create(uid: string, displayText?: string): string {
    if (displayText && displayText !== uid) {
      return `[[${uid}|${displayText}]]`;
    }
    return `[[${uid}]]`;
  }
  
  /**
   * Parse a single wikilink string
   */
  parseSingle(wikilink: string): WikiLink | null {
    const match = wikilink.match(WikilinkParser.SINGLE_WIKILINK_REGEX);
    if (!match) return null;
    
    return {
      uid: match[1].trim(),
      displayText: match[2]?.trim(),
      start: 0,
      end: wikilink.length,
    };
  }
  
  /**
   * Validate a UID format (PRD-compliant)
   */
  isValidUID(uid: string): boolean {
    // Format: {type}-{slug}-{counter}
    // Type: lowercase letters
    // Slug: lowercase alphanumeric with hyphens
    // Counter: 3+ digits
    return /^[a-z]+-[a-z0-9-]+-\d{3,}$/.test(uid);
  }
  
  /**
   * Check if a string is a wikilink
   */
  isWikilink(text: string): boolean {
    return WikilinkParser.SINGLE_WIKILINK_REGEX.test(text.trim());
  }
  
  /**
   * Find wikilinks at specific positions
   */
  findAt(content: string, position: number): WikiLink | null {
    const links = this.extract(content);
    return links.find(link => position >= link.start && position <= link.end) || null;
  }
  
  /**
   * Get all broken links (UIDs that don't pass validation)
   */
  findBrokenLinks(content: string): WikiLink[] {
    const links = this.extract(content);
    return links.filter(link => !this.isValidUID(link.uid));
  }
  
  /**
   * Replace a specific wikilink
   */
  replaceLink(content: string, oldUid: string, newUid: string, newDisplayText?: string): string {
    return this.transform(content, (link, raw) => {
      if (link.uid === oldUid) {
        return this.create(newUid, newDisplayText || link.displayText);
      }
      return raw;
    });
  }
  
  /**
   * Remove all wikilinks from content (keep display text if available)
   */
  strip(content: string): string {
    return content.replace(
      WikilinkParser.WIKILINK_REGEX,
      (match, uid, displayText) => displayText?.trim() || uid.trim()
    );
  }
  
  /**
   * Escape text that might be confused with wikilinks
   */
  escape(text: string): string {
    return text.replace(/\[\[/g, '\\[\\[').replace(/\]\]/g, '\\]\\]');
  }
  
  /**
   * Unescape previously escaped wikilink syntax
   */
  unescape(text: string): string {
    return text.replace(/\\\[\\\[/g, '[[').replace(/\\\]\\\]/g, ']]');
  }
  
  /**
   * Build a link map from content for quick lookups
   */
  buildLinkMap(content: string): Map<string, WikiLink[]> {
    const links = this.extract(content);
    const map = new Map<string, WikiLink[]>();
    
    for (const link of links) {
      const existing = map.get(link.uid) || [];
      existing.push(link);
      map.set(link.uid, existing);
    }
    
    return map;
  }
  
  /**
   * Get statistics about wikilinks in content
   */
  getStats(content: string): {
    total: number;
    unique: number;
    valid: number;
    invalid: number;
    withDisplayText: number;
  } {
    const links = this.extract(content);
    const uniqueUIDs = new Set(links.map(l => l.uid));
    
    return {
      total: links.length,
      unique: uniqueUIDs.size,
      valid: links.filter(l => this.isValidUID(l.uid)).length,
      invalid: links.filter(l => !this.isValidUID(l.uid)).length,
      withDisplayText: links.filter(l => l.displayText !== undefined).length,
    };
  }
}
