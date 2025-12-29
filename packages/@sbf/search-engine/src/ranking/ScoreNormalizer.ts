/**
 * Score normalizer.
 * 
 * Normalizes scores from different search sources to a common scale.
 */

import { SearchResult, SearchResultSource } from '../models/SearchResult';

/**
 * Normalization method.
 */
export type NormalizationMethod = 'minmax' | 'zscore' | 'sigmoid' | 'none';

/**
 * Score normalizer configuration.
 */
export interface NormalizerConfig {
  /** Normalization method */
  method?: NormalizationMethod;
  
  /** Minimum expected score (for minmax) */
  minScore?: number;
  
  /** Maximum expected score (for minmax) */
  maxScore?: number;
  
  /** Sigmoid scale factor */
  sigmoidScale?: number;
}

/**
 * Score normalizer implementation.
 */
export class ScoreNormalizer {
  private readonly config: Required<NormalizerConfig>;
  
  constructor(config: NormalizerConfig = {}) {
    this.config = {
      method: config.method ?? 'minmax',
      minScore: config.minScore ?? 0,
      maxScore: config.maxScore ?? 1,
      sigmoidScale: config.sigmoidScale ?? 1,
    };
  }
  
  /**
   * Normalize scores for a list of results.
   */
  normalize(results: SearchResult[], source?: SearchResultSource): SearchResult[] {
    if (results.length === 0) return results;
    
    switch (this.config.method) {
      case 'minmax':
        return this.normalizeMinMax(results);
      case 'zscore':
        return this.normalizeZScore(results);
      case 'sigmoid':
        return this.normalizeSigmoid(results);
      case 'none':
        return results;
      default:
        return this.normalizeMinMax(results);
    }
  }
  
  /**
   * Min-max normalization.
   * 
   * Scales scores to [0, 1] range based on min/max in the dataset.
   */
  private normalizeMinMax(results: SearchResult[]): SearchResult[] {
    const scores = results.map(r => r.score);
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    
    // Avoid division by zero
    if (max === min) {
      return results.map(r => ({ ...r, score: 1 }));
    }
    
    return results.map(r => ({
      ...r,
      rawScore: r.rawScore ?? r.score,
      score: (r.score - min) / (max - min),
    }));
  }
  
  /**
   * Z-score normalization.
   * 
   * Normalizes based on standard deviations from mean.
   */
  private normalizeZScore(results: SearchResult[]): SearchResult[] {
    const scores = results.map(r => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Avoid division by zero
    if (stdDev === 0) {
      return results.map(r => ({ ...r, score: 0.5 }));
    }
    
    return results.map(r => {
      // Z-score
      const zScore = (r.score - mean) / stdDev;
      
      // Convert to 0-1 range using sigmoid
      const normalizedScore = 1 / (1 + Math.exp(-zScore));
      
      return {
        ...r,
        rawScore: r.rawScore ?? r.score,
        score: normalizedScore,
      };
    });
  }
  
  /**
   * Sigmoid normalization.
   * 
   * Applies sigmoid function to compress scores to [0, 1].
   */
  private normalizeSigmoid(results: SearchResult[]): SearchResult[] {
    const scale = this.config.sigmoidScale;
    
    return results.map(r => ({
      ...r,
      rawScore: r.rawScore ?? r.score,
      score: 1 / (1 + Math.exp(-scale * r.score)),
    }));
  }
  
  /**
   * Normalize a single score.
   */
  normalizeScore(score: number, min: number, max: number): number {
    if (max === min) return 1;
    return (score - min) / (max - min);
  }
  
  /**
   * Combine scores from multiple sources.
   */
  combineScores(
    scores: { score: number; weight: number }[]
  ): number {
    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    if (totalWeight === 0) return 0;
    
    return scores.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;
  }
}
