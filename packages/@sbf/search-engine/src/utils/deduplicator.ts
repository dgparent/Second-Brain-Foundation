/**
 * Result deduplicator.
 * 
 * Removes duplicate results and merges scores for items found by multiple sources.
 */

import { SearchResult } from '../models/SearchResult';

/**
 * Deduplication options.
 */
export interface DeduplicationOptions {
  /** Merge scores when duplicates are found */
  mergeScores?: boolean;
  
  /** How to merge scores: 'sum', 'max', 'average' */
  scoreStrategy?: 'sum' | 'max' | 'average';
  
  /** Prefer metadata from which source */
  preferSource?: 'text' | 'vector' | 'first';
}

/**
 * Deduplicate search results by ID.
 * 
 * When the same entity appears in both text and vector results,
 * this function merges them into a single result.
 */
export function deduplicateResults(
  results: SearchResult[],
  threshold: number = 0.85,
  options: DeduplicationOptions = {}
): SearchResult[] {
  const { 
    mergeScores = true, 
    scoreStrategy = 'sum',
    preferSource = 'first',
  } = options;
  
  const resultMap = new Map<string, SearchResult[]>();
  
  // Group by ID
  for (const result of results) {
    const existing = resultMap.get(result.id) ?? [];
    existing.push(result);
    resultMap.set(result.id, existing);
  }
  
  // Merge duplicates
  const deduped: SearchResult[] = [];
  
  for (const [id, duplicates] of resultMap) {
    if (duplicates.length === 1) {
      deduped.push(duplicates[0]);
      continue;
    }
    
    // Merge duplicates
    const merged = mergeDuplicates(duplicates, mergeScores, scoreStrategy, preferSource);
    deduped.push(merged);
  }
  
  return deduped;
}

/**
 * Merge multiple results for the same entity.
 */
function mergeDuplicates(
  results: SearchResult[],
  mergeScores: boolean,
  scoreStrategy: 'sum' | 'max' | 'average',
  preferSource: 'text' | 'vector' | 'first'
): SearchResult {
  // Determine which result to use as base
  let base: SearchResult;
  
  if (preferSource === 'first') {
    base = results[0];
  } else {
    base = results.find(r => r.searchSource === preferSource) ?? results[0];
  }
  
  // Calculate merged score
  let score: number;
  const scores = results.map(r => r.score);
  
  if (!mergeScores) {
    score = base.score;
  } else {
    switch (scoreStrategy) {
      case 'sum':
        score = scores.reduce((a, b) => a + b, 0);
        break;
      case 'max':
        score = Math.max(...scores);
        break;
      case 'average':
        score = scores.reduce((a, b) => a + b, 0) / scores.length;
        break;
      default:
        score = base.score;
    }
  }
  
  // Merge highlights
  const allHighlights = results.flatMap(r => r.highlights ?? []);
  const uniqueHighlights = allHighlights.filter((h, i) =>
    allHighlights.findIndex(other => 
      other.field === h.field && other.text === h.text
    ) === i
  );
  
  // Determine search source
  const sources = new Set(results.map(r => r.searchSource));
  const searchSource = sources.size > 1 ? 'hybrid' : results[0].searchSource;
  
  return {
    ...base,
    score,
    searchSource,
    highlights: uniqueHighlights.length > 0 ? uniqueHighlights : undefined,
    metadata: {
      ...base.metadata,
      mergedFrom: results.length,
      originalScores: scores,
    },
  };
}

/**
 * Remove near-duplicate results based on content similarity.
 * 
 * This is more aggressive than ID-based deduplication and removes
 * results that have very similar content even if they have different IDs.
 */
export function removeNearDuplicates(
  results: SearchResult[],
  similarityThreshold: number = 0.9
): SearchResult[] {
  const unique: SearchResult[] = [];
  
  for (const result of results) {
    const isDuplicate = unique.some(existing =>
      calculateSimilarity(existing.snippet, result.snippet) >= similarityThreshold
    );
    
    if (!isDuplicate) {
      unique.push(result);
    }
  }
  
  return unique;
}

/**
 * Calculate Jaccard similarity between two strings.
 */
function calculateSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  
  // Tokenize
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  
  // Calculate Jaccard similarity
  const intersection = new Set([...tokensA].filter(t => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);
  
  if (union.size === 0) return 0;
  
  return intersection.size / union.size;
}

/**
 * Tokenize a string into words.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);
}
