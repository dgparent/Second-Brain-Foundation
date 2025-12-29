/**
 * Search result highlighter.
 * 
 * Provides utilities for highlighting search matches in text.
 */

import { SearchHighlight } from '../models/SearchResult';

/**
 * Highlight configuration.
 */
export interface HighlightConfig {
  /** Tag to wrap highlighted text (start) */
  startTag?: string;
  
  /** Tag to wrap highlighted text (end) */
  endTag?: string;
  
  /** Maximum number of fragments to return */
  maxFragments?: number;
  
  /** Target length of each fragment */
  fragmentLength?: number;
  
  /** Whether to merge overlapping highlights */
  mergeOverlapping?: boolean;
}

const DEFAULT_CONFIG: Required<HighlightConfig> = {
  startTag: '<mark>',
  endTag: '</mark>',
  maxFragments: 3,
  fragmentLength: 100,
  mergeOverlapping: true,
};

/**
 * Highlight matches in text.
 */
export function highlightMatches(
  text: string,
  query: string,
  config: HighlightConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (!text || !query) return text;
  
  // Escape regex special characters in query
  const escapedQuery = escapeRegex(query);
  
  // Split query into words for matching
  const words = escapedQuery.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return text;
  
  // Build regex pattern
  const pattern = new RegExp(`(${words.join('|')})`, 'gi');
  
  // Replace matches with highlighted version
  return text.replace(pattern, `${cfg.startTag}$1${cfg.endTag}`);
}

/**
 * Extract highlighted fragments from text.
 */
export function extractFragments(
  text: string,
  query: string,
  config: HighlightConfig = {}
): SearchHighlight[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (!text || !query) return [];
  
  const escapedQuery = escapeRegex(query);
  const words = escapedQuery.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) return [];
  
  const pattern = new RegExp(words.join('|'), 'gi');
  const highlights: SearchHighlight[] = [];
  const halfFragment = Math.floor(cfg.fragmentLength / 2);
  
  let match: RegExpExecArray | null;
  const matches: { index: number; length: number }[] = [];
  
  // Find all matches
  while ((match = pattern.exec(text)) !== null) {
    matches.push({ index: match.index, length: match[0].length });
  }
  
  if (matches.length === 0) return [];
  
  // Merge overlapping matches if configured
  const mergedMatches = cfg.mergeOverlapping 
    ? mergeOverlappingMatches(matches, halfFragment)
    : matches;
  
  // Extract fragments around each match
  for (let i = 0; i < Math.min(mergedMatches.length, cfg.maxFragments); i++) {
    const { index } = mergedMatches[i];
    
    // Calculate fragment boundaries
    let start = Math.max(0, index - halfFragment);
    let end = Math.min(text.length, index + halfFragment);
    
    // Adjust to word boundaries
    if (start > 0) {
      const nextSpace = text.indexOf(' ', start);
      if (nextSpace !== -1 && nextSpace < index) {
        start = nextSpace + 1;
      }
    }
    
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > index) {
        end = lastSpace;
      }
    }
    
    // Extract and highlight fragment
    let fragment = text.slice(start, end);
    
    // Add ellipsis if needed
    if (start > 0) fragment = '...' + fragment;
    if (end < text.length) fragment = fragment + '...';
    
    // Highlight matches in fragment
    const highlightedFragment = highlightMatches(fragment, query, cfg);
    
    highlights.push({
      field: 'content',
      text: highlightedFragment,
      start,
      end,
    });
  }
  
  return highlights;
}

/**
 * Merge overlapping match ranges.
 */
function mergeOverlappingMatches(
  matches: { index: number; length: number }[],
  distance: number
): { index: number; length: number }[] {
  if (matches.length <= 1) return matches;
  
  // Sort by index
  const sorted = [...matches].sort((a, b) => a.index - b.index);
  const merged: { index: number; length: number }[] = [];
  
  let current = sorted[0];
  
  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Check if overlapping or close
    if (next.index - (current.index + current.length) < distance) {
      // Merge
      current = {
        index: current.index,
        length: Math.max(current.length, next.index + next.length - current.index),
      };
    } else {
      merged.push(current);
      current = next;
    }
  }
  
  merged.push(current);
  return merged;
}

/**
 * Create snippet from text with highlighted matches.
 */
export function createSnippet(
  text: string,
  query: string,
  maxLength: number = 200,
  config: HighlightConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (!text) return '';
  
  // If text is short enough, just highlight and return
  if (text.length <= maxLength) {
    return highlightMatches(text, query, cfg);
  }
  
  // Find first match
  const escapedQuery = escapeRegex(query);
  const words = escapedQuery.split(/\s+/).filter(w => w.length > 0);
  
  if (words.length === 0) {
    return text.slice(0, maxLength) + '...';
  }
  
  const pattern = new RegExp(words.join('|'), 'gi');
  const match = pattern.exec(text);
  
  if (!match) {
    return text.slice(0, maxLength) + '...';
  }
  
  // Extract snippet around first match
  const halfLength = Math.floor(maxLength / 2);
  let start = Math.max(0, match.index - halfLength);
  let end = Math.min(text.length, match.index + halfLength);
  
  // Adjust to word boundaries
  if (start > 0) {
    const nextSpace = text.indexOf(' ', start);
    if (nextSpace !== -1 && nextSpace < match.index) {
      start = nextSpace + 1;
    }
  }
  
  if (end < text.length) {
    const lastSpace = text.lastIndexOf(' ', end);
    if (lastSpace > match.index) {
      end = lastSpace;
    }
  }
  
  let snippet = text.slice(start, end);
  
  // Add ellipsis
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  
  return highlightMatches(snippet, query, cfg);
}

/**
 * Strip highlight tags from text.
 */
export function stripHighlights(
  text: string,
  config: HighlightConfig = {}
): string {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  const startRegex = new RegExp(escapeRegex(cfg.startTag), 'g');
  const endRegex = new RegExp(escapeRegex(cfg.endTag), 'g');
  
  return text.replace(startRegex, '').replace(endRegex, '');
}

/**
 * Escape special regex characters.
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
