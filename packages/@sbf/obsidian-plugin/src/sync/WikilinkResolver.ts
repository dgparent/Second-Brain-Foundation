/**
 * WikilinkResolver - Link Resolution & Conversion
 * 
 * Resolves Obsidian [[wikilinks]] to SBF entity UIDs.
 * Per PRD FR11-FR12: Typed relationship linking
 */

import { Vault, TFile, MetadataCache } from 'obsidian';
import { WikilinkMatch, ResolvedLink, EntityRelationships } from '../types';

export class WikilinkResolver {
  // Match [[Page Name]] or [[Page Name|Display Text]]
  private static readonly WIKILINK_REGEX = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;
  
  // Match [Display](sbf://uid)
  private static readonly SBF_LINK_REGEX = /\[([^\]]+)\]\(sbf:\/\/([^)]+)\)/g;
  
  // Match embedded files ![[image.png]]
  private static readonly EMBED_REGEX = /!\[\[([^\]]+)\]\]/g;

  constructor(
    private vault: Vault,
    private cache: MetadataCache,
    private uidMap: Map<string, string> // path -> UID
  ) {}

  /**
   * Extract all wikilinks from content
   */
  extractLinks(content: string): WikilinkMatch[] {
    const matches: WikilinkMatch[] = [];

    // Reset regex lastIndex
    WikilinkResolver.WIKILINK_REGEX.lastIndex = 0;
    WikilinkResolver.SBF_LINK_REGEX.lastIndex = 0;

    // Standard wikilinks: [[Page Name]] or [[Page Name|Display Text]]
    let match;
    while ((match = WikilinkResolver.WIKILINK_REGEX.exec(content)) !== null) {
      matches.push({
        original: match[0],
        target: match[1],
        display: match[2] || match[1],
        type: 'wikilink',
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    // SBF typed links: [Display](sbf://uid)
    while ((match = WikilinkResolver.SBF_LINK_REGEX.exec(content)) !== null) {
      matches.push({
        original: match[0],
        target: match[2], // UID
        display: match[1],
        type: 'sbf-link',
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    return matches;
  }

  /**
   * Extract embedded files from content
   */
  extractEmbeds(content: string): WikilinkMatch[] {
    const matches: WikilinkMatch[] = [];
    WikilinkResolver.EMBED_REGEX.lastIndex = 0;

    let match;
    while ((match = WikilinkResolver.EMBED_REGEX.exec(content)) !== null) {
      matches.push({
        original: match[0],
        target: match[1],
        display: match[1],
        type: 'wikilink',
        position: { start: match.index, end: match.index + match[0].length },
      });
    }

    return matches;
  }

  /**
   * Resolve wikilink target to file path
   */
  resolveToPath(target: string, sourcePath?: string): string | null {
    // Check if it's a direct path
    let file = this.vault.getAbstractFileByPath(target);
    if (file instanceof TFile) {
      return file.path;
    }

    // Try with .md extension
    file = this.vault.getAbstractFileByPath(`${target}.md`);
    if (file instanceof TFile) {
      return file.path;
    }

    // Use metadata cache for fuzzy matching
    if (this.cache) {
      const resolvedFile = this.cache.getFirstLinkpathDest(
        target,
        sourcePath || ''
      );
      return resolvedFile?.path || null;
    }

    return null;
  }

  /**
   * Resolve wikilink to SBF UID
   */
  resolveToUid(target: string, sourcePath?: string): string | null {
    const path = this.resolveToPath(target, sourcePath);
    if (!path) return null;

    return this.uidMap.get(path) || null;
  }

  /**
   * Resolve all links in content
   */
  resolveAll(content: string, sourcePath?: string): ResolvedLink[] {
    const links = this.extractLinks(content);
    
    return links.map((link) => ({
      ...link,
      uid: link.type === 'sbf-link' 
        ? link.target 
        : this.resolveToUid(link.target, sourcePath),
      path: link.type === 'sbf-link' 
        ? this.getPathForUid(link.target)
        : this.resolveToPath(link.target, sourcePath),
    }));
  }

  /**
   * Get file path for a UID
   */
  private getPathForUid(uid: string): string | null {
    for (const [path, mappedUid] of this.uidMap) {
      if (mappedUid === uid) {
        return path;
      }
    }
    return null;
  }

  /**
   * Convert wikilinks to SBF typed links
   */
  convertToSBFLinks(content: string, sourcePath?: string): string {
    WikilinkResolver.WIKILINK_REGEX.lastIndex = 0;

    return content.replace(
      WikilinkResolver.WIKILINK_REGEX,
      (match, target, display) => {
        const uid = this.resolveToUid(target, sourcePath);
        if (uid) {
          return `[${display || target}](sbf://${uid})`;
        }
        return match; // Keep original if can't resolve
      }
    );
  }

  /**
   * Convert SBF links back to wikilinks
   */
  convertToWikilinks(content: string): string {
    WikilinkResolver.SBF_LINK_REGEX.lastIndex = 0;

    // Build reverse map: UID -> path
    const uidToPath = new Map<string, string>();
    for (const [path, uid] of this.uidMap) {
      uidToPath.set(uid, path);
    }

    return content.replace(
      WikilinkResolver.SBF_LINK_REGEX,
      (match, display, uid) => {
        const path = uidToPath.get(uid);
        if (path) {
          const name = path.replace('.md', '').split('/').pop();
          if (name === display) {
            return `[[${name}]]`;
          }
          return `[[${name}|${display}]]`;
        }
        return match;
      }
    );
  }

  /**
   * Build relationship map from content
   * Per PRD FR11-FR12
   */
  buildRelationships(content: string, sourcePath?: string): EntityRelationships {
    const links = this.extractLinks(content);
    const relationships: EntityRelationships = {
      related_to: [],
      mentioned: [],
    };

    const seen = new Set<string>();

    for (const link of links) {
      const uid =
        link.type === 'sbf-link'
          ? link.target
          : this.resolveToUid(link.target, sourcePath);

      if (uid && !seen.has(uid)) {
        seen.add(uid);
        // All direct links are "related_to"
        relationships.related_to!.push(uid);
      }
    }

    return relationships;
  }

  /**
   * Find all files that link to a given file
   * (backlinks/incoming links)
   */
  findBacklinks(targetPath: string): string[] {
    const backlinks: string[] = [];
    const targetName = targetPath.replace('.md', '').split('/').pop()!;

    for (const file of this.vault.getMarkdownFiles()) {
      if (file.path === targetPath) continue;

      const cache = this.cache.getFileCache(file);
      if (!cache?.links) continue;

      const hasLink = cache.links.some(
        (link) =>
          link.link === targetName ||
          link.link === targetPath ||
          link.link === targetPath.replace('.md', '')
      );

      if (hasLink) {
        backlinks.push(file.path);
      }
    }

    return backlinks;
  }

  /**
   * Find orphan files (no incoming or outgoing links)
   */
  findOrphans(): string[] {
    const orphans: string[] = [];
    const linked = new Set<string>();

    // Build set of all linked files
    for (const file of this.vault.getMarkdownFiles()) {
      const cache = this.cache.getFileCache(file);
      if (!cache?.links) continue;

      for (const link of cache.links) {
        const resolved = this.resolveToPath(link.link, file.path);
        if (resolved) {
          linked.add(resolved);
        }
      }

      // File has outgoing links, not an orphan
      if (cache.links.length > 0) {
        linked.add(file.path);
      }
    }

    // Find files not in linked set
    for (const file of this.vault.getMarkdownFiles()) {
      if (!linked.has(file.path)) {
        orphans.push(file.path);
      }
    }

    return orphans;
  }

  /**
   * Update UID map
   */
  setUidMap(map: Map<string, string>): void {
    this.uidMap.clear();
    for (const [path, uid] of map) {
      this.uidMap.set(path, uid);
    }
  }

  /**
   * Add single mapping
   */
  addMapping(path: string, uid: string): void {
    this.uidMap.set(path, uid);
  }

  /**
   * Remove mapping
   */
  removeMapping(path: string): void {
    this.uidMap.delete(path);
  }

  /**
   * Get statistics about links in vault
   */
  getLinkStats(): LinkStats {
    let totalLinks = 0;
    let resolvedLinks = 0;
    let brokenLinks = 0;
    let sbfLinks = 0;
    const linksByFile = new Map<string, number>();

    for (const file of this.vault.getMarkdownFiles()) {
      const cache = this.cache.getFileCache(file);
      const linkCount = cache?.links?.length || 0;
      linksByFile.set(file.path, linkCount);
      totalLinks += linkCount;

      for (const link of cache?.links || []) {
        const resolved = this.resolveToPath(link.link, file.path);
        if (resolved) {
          resolvedLinks++;
        } else {
          brokenLinks++;
        }
      }
    }

    return {
      totalLinks,
      resolvedLinks,
      brokenLinks,
      sbfLinks,
      averageLinksPerFile: totalLinks / this.vault.getMarkdownFiles().length,
    };
  }
}

/**
 * Link statistics
 */
export interface LinkStats {
  /** Total number of links in vault */
  totalLinks: number;
  /** Links that resolve to existing files */
  resolvedLinks: number;
  /** Links to non-existent files */
  brokenLinks: number;
  /** SBF-format links */
  sbfLinks: number;
  /** Average links per file */
  averageLinksPerFile: number;
}
