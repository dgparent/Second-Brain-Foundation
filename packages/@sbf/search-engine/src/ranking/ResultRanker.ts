/**
 * Result ranker.
 * 
 * Implements various ranking strategies for search results.
 */

import { SearchResult } from '../models/SearchResult';

/**
 * Available ranking strategies.
 */
export type RankingStrategy =
  | 'score'
  | 'reciprocal-rank-fusion'
  | 'weighted-combination'
  | 'round-robin';

/**
 * Ranker configuration.
 */
export interface RankerConfig {
  /** Constant k for RRF (typically 60) */
  rrfK?: number;
  
  /** Weights for different sources */
  sourceWeights?: {
    text?: number;
    vector?: number;
    hybrid?: number;
  };
}

/**
 * Result ranker implementation.
 */
export class ResultRanker {
  private readonly strategy: RankingStrategy;
  private readonly config: Required<RankerConfig>;
  
  constructor(strategy: RankingStrategy = 'reciprocal-rank-fusion', config: RankerConfig = {}) {
    this.strategy = strategy;
    this.config = {
      rrfK: config.rrfK ?? 60,
      sourceWeights: {
        text: config.sourceWeights?.text ?? 0.4,
        vector: config.sourceWeights?.vector ?? 0.6,
        hybrid: config.sourceWeights?.hybrid ?? 1.0,
      },
    };
  }
  
  /**
   * Rank results using the configured strategy.
   */
  rank(results: SearchResult[]): SearchResult[] {
    switch (this.strategy) {
      case 'score':
        return this.rankByScore(results);
      case 'reciprocal-rank-fusion':
        return this.rankByRRF(results);
      case 'weighted-combination':
        return this.rankByWeightedCombination(results);
      case 'round-robin':
        return this.rankByRoundRobin(results);
      default:
        return this.rankByScore(results);
    }
  }
  
  /**
   * Simple score-based ranking.
   */
  private rankByScore(results: SearchResult[]): SearchResult[] {
    return [...results].sort((a, b) => b.score - a.score);
  }
  
  /**
   * Reciprocal Rank Fusion (RRF).
   * 
   * Combines rankings from multiple sources using the formula:
   * RRF(d) = Σ 1 / (k + rank_i(d))
   */
  private rankByRRF(results: SearchResult[]): SearchResult[] {
    const k = this.config.rrfK;
    
    // Group results by ID to find duplicates from different sources
    const resultMap = new Map<string, {
      result: SearchResult;
      ranks: { source: string; rank: number }[];
    }>();
    
    // First, sort each source's results by score and assign ranks
    const textResults = results
      .filter(r => r.searchSource === 'text')
      .sort((a, b) => b.score - a.score);
    
    const vectorResults = results
      .filter(r => r.searchSource === 'vector')
      .sort((a, b) => b.score - a.score);
    
    // Assign ranks
    textResults.forEach((result, index) => {
      const existing = resultMap.get(result.id);
      if (existing) {
        existing.ranks.push({ source: 'text', rank: index + 1 });
      } else {
        resultMap.set(result.id, {
          result,
          ranks: [{ source: 'text', rank: index + 1 }],
        });
      }
    });
    
    vectorResults.forEach((result, index) => {
      const existing = resultMap.get(result.id);
      if (existing) {
        existing.ranks.push({ source: 'vector', rank: index + 1 });
        // Merge metadata from vector result if text result exists
        existing.result = {
          ...existing.result,
          searchSource: 'hybrid',
        };
      } else {
        resultMap.set(result.id, {
          result,
          ranks: [{ source: 'vector', rank: index + 1 }],
        });
      }
    });
    
    // Calculate RRF scores
    const scoredResults: SearchResult[] = [];
    
    for (const { result, ranks } of resultMap.values()) {
      const rrfScore = ranks.reduce((sum, { rank }) => {
        return sum + 1 / (k + rank);
      }, 0);
      
      scoredResults.push({
        ...result,
        score: rrfScore,
        rawScore: result.rawScore,
      });
    }
    
    // Sort by RRF score
    return scoredResults.sort((a, b) => b.score - a.score);
  }
  
  /**
   * Weighted combination ranking.
   */
  private rankByWeightedCombination(results: SearchResult[]): SearchResult[] {
    // Group by ID and combine scores
    const resultMap = new Map<string, SearchResult>();
    
    for (const result of results) {
      const weight = this.getSourceWeight(result.searchSource);
      const weightedScore = result.score * weight;
      
      const existing = resultMap.get(result.id);
      if (existing) {
        // Combine scores
        resultMap.set(result.id, {
          ...existing,
          score: existing.score + weightedScore,
          searchSource: 'hybrid',
        });
      } else {
        resultMap.set(result.id, {
          ...result,
          score: weightedScore,
        });
      }
    }
    
    return [...resultMap.values()].sort((a, b) => b.score - a.score);
  }
  
  /**
   * Round-robin ranking (interleave sources).
   */
  private rankByRoundRobin(results: SearchResult[]): SearchResult[] {
    // Separate by source and sort
    const textResults = results
      .filter(r => r.searchSource === 'text')
      .sort((a, b) => b.score - a.score);
    
    const vectorResults = results
      .filter(r => r.searchSource === 'vector')
      .sort((a, b) => b.score - a.score);
    
    // Interleave
    const interleaved: SearchResult[] = [];
    const seenIds = new Set<string>();
    
    const maxLen = Math.max(textResults.length, vectorResults.length);
    
    for (let i = 0; i < maxLen; i++) {
      // Add vector result (prioritize semantic)
      if (i < vectorResults.length) {
        const result = vectorResults[i];
        if (!seenIds.has(result.id)) {
          interleaved.push(result);
          seenIds.add(result.id);
        }
      }
      
      // Add text result
      if (i < textResults.length) {
        const result = textResults[i];
        if (!seenIds.has(result.id)) {
          interleaved.push(result);
          seenIds.add(result.id);
        }
      }
    }
    
    return interleaved;
  }
  
  /**
   * Get weight for a search source.
   */
  private getSourceWeight(source: string): number {
    switch (source) {
      case 'text':
        return this.config.sourceWeights.text;
      case 'vector':
        return this.config.sourceWeights.vector;
      default:
        return this.config.sourceWeights.hybrid;
    }
  }
}
