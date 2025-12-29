/**
 * Ranking utilities tests.
 */

import { ResultRanker } from '../src/ranking/ResultRanker';
import { ScoreNormalizer } from '../src/ranking/ScoreNormalizer';
import { SearchResult } from '../src/models/SearchResult';

describe('ResultRanker', () => {
  const createResult = (id: string, score: number, source: 'text' | 'vector'): SearchResult => ({
    id,
    entityType: 'source',
    title: `Result ${id}`,
    snippet: `Snippet for ${id}`,
    score,
    searchSource: source,
  });

  describe('score ranking', () => {
    it('should sort by score descending', () => {
      const ranker = new ResultRanker('score');
      const results = [
        createResult('1', 0.5, 'text'),
        createResult('2', 0.9, 'vector'),
        createResult('3', 0.7, 'text'),
      ];
      
      const ranked = ranker.rank(results);
      
      expect(ranked[0].id).toBe('2');
      expect(ranked[1].id).toBe('3');
      expect(ranked[2].id).toBe('1');
    });
  });

  describe('reciprocal rank fusion', () => {
    it('should combine rankings from multiple sources', () => {
      const ranker = new ResultRanker('reciprocal-rank-fusion');
      const results = [
        createResult('1', 0.9, 'text'),  // Rank 1 in text
        createResult('2', 0.7, 'text'),  // Rank 2 in text
        createResult('1', 0.8, 'vector'), // Same ID, rank 1 in vector
        createResult('3', 0.95, 'vector'), // Rank 2 in vector
      ];
      
      const ranked = ranker.rank(results);
      
      // Result 1 should be boosted (appears in both)
      const result1 = ranked.find(r => r.id === '1');
      expect(result1).toBeDefined();
      expect(result1?.searchSource).toBe('hybrid');
    });
  });

  describe('round robin', () => {
    it('should interleave results from different sources', () => {
      const ranker = new ResultRanker('round-robin');
      const results = [
        createResult('t1', 0.9, 'text'),
        createResult('t2', 0.8, 'text'),
        createResult('v1', 0.9, 'vector'),
        createResult('v2', 0.8, 'vector'),
      ];
      
      const ranked = ranker.rank(results);
      
      // Vector results should be prioritized but interleaved
      expect(ranked[0].searchSource).toBe('vector');
      expect(ranked[1].searchSource).toBe('text');
    });
  });
});

describe('ScoreNormalizer', () => {
  const createResults = (scores: number[]): SearchResult[] =>
    scores.map((score, i) => ({
      id: String(i),
      entityType: 'source',
      title: `Result ${i}`,
      snippet: '',
      score,
      searchSource: 'text' as const,
    }));

  describe('minmax normalization', () => {
    it('should normalize scores to 0-1 range', () => {
      const normalizer = new ScoreNormalizer({ method: 'minmax' });
      const results = createResults([10, 50, 100]);
      
      const normalized = normalizer.normalize(results);
      
      expect(normalized[0].score).toBe(0);    // min
      expect(normalized[2].score).toBe(1);    // max
      expect(normalized[1].score).toBeCloseTo(0.444, 2); // middle
    });

    it('should handle single result', () => {
      const normalizer = new ScoreNormalizer({ method: 'minmax' });
      const results = createResults([0.5]);
      
      const normalized = normalizer.normalize(results);
      
      expect(normalized[0].score).toBe(1);
    });
  });

  describe('zscore normalization', () => {
    it('should normalize based on standard deviation', () => {
      const normalizer = new ScoreNormalizer({ method: 'zscore' });
      const results = createResults([0, 50, 100]);
      
      const normalized = normalizer.normalize(results);
      
      // Mean is 50, so middle result should be around 0.5
      expect(normalized[1].score).toBeCloseTo(0.5, 1);
    });
  });

  describe('sigmoid normalization', () => {
    it('should apply sigmoid function', () => {
      const normalizer = new ScoreNormalizer({ method: 'sigmoid' });
      const results = createResults([0, 1, 2]);
      
      const normalized = normalizer.normalize(results);
      
      // All scores should be between 0 and 1
      normalized.forEach(r => {
        expect(r.score).toBeGreaterThan(0);
        expect(r.score).toBeLessThan(1);
      });
    });
  });

  describe('combineScores', () => {
    it('should calculate weighted average', () => {
      const normalizer = new ScoreNormalizer();
      
      const combined = normalizer.combineScores([
        { score: 0.8, weight: 0.6 },
        { score: 0.6, weight: 0.4 },
      ]);
      
      expect(combined).toBeCloseTo(0.72, 2);
    });
  });
});
