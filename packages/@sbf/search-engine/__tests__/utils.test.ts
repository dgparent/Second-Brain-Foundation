/**
 * Utility function tests.
 */

import { deduplicateResults, removeNearDuplicates } from '../src/utils/deduplicator';
import { highlightMatches, extractFragments, createSnippet, stripHighlights } from '../src/utils/highlighter';
import { expandQuery, extractKeywords, parsePhrasesAndTerms, buildTsQuery } from '../src/utils/queryExpander';
import { SearchResult } from '../src/models/SearchResult';

describe('deduplicator', () => {
  const createResult = (id: string, score: number, source: 'text' | 'vector'): SearchResult => ({
    id,
    entityType: 'source',
    title: `Result ${id}`,
    snippet: `Snippet for ${id}`,
    score,
    searchSource: source,
  });

  describe('deduplicateResults', () => {
    it('should merge results with same ID', () => {
      const results = [
        createResult('1', 0.6, 'text'),
        createResult('1', 0.8, 'vector'),
        createResult('2', 0.7, 'text'),
      ];
      
      const deduped = deduplicateResults(results);
      
      expect(deduped).toHaveLength(2);
      const result1 = deduped.find(r => r.id === '1');
      expect(result1).toBeDefined();
      // Score should be combined (sum by default)
      expect(result1!.score).toBe(1.4);
    });

    it('should respect score strategy', () => {
      const results = [
        createResult('1', 0.6, 'text'),
        createResult('1', 0.8, 'vector'),
      ];
      
      const maxDeduped = deduplicateResults(results, 0.85, { scoreStrategy: 'max' });
      expect(maxDeduped[0].score).toBe(0.8);
      
      const avgDeduped = deduplicateResults(results, 0.85, { scoreStrategy: 'average' });
      expect(avgDeduped[0].score).toBe(0.7);
    });
  });

  describe('removeNearDuplicates', () => {
    it('should remove similar content', () => {
      const results: SearchResult[] = [
        { id: '1', entityType: 'source', title: 'A', snippet: 'The quick brown fox', score: 0.9, searchSource: 'text' },
        { id: '2', entityType: 'source', title: 'B', snippet: 'The quick brown fox jumps', score: 0.8, searchSource: 'text' },
        { id: '3', entityType: 'source', title: 'C', snippet: 'Something completely different', score: 0.7, searchSource: 'text' },
      ];
      
      const unique = removeNearDuplicates(results, 0.6);
      
      expect(unique.length).toBeLessThanOrEqual(2);
    });
  });
});

describe('highlighter', () => {
  describe('highlightMatches', () => {
    it('should highlight matching words', () => {
      const text = 'The quick brown fox jumps over the lazy dog';
      const highlighted = highlightMatches(text, 'quick fox');
      
      expect(highlighted).toContain('<mark>quick</mark>');
      expect(highlighted).toContain('<mark>fox</mark>');
    });

    it('should use custom tags', () => {
      const text = 'Hello world';
      const highlighted = highlightMatches(text, 'world', {
        startTag: '<b>',
        endTag: '</b>',
      });
      
      expect(highlighted).toBe('Hello <b>world</b>');
    });

    it('should be case insensitive', () => {
      const text = 'Hello WORLD';
      const highlighted = highlightMatches(text, 'world');
      
      expect(highlighted).toContain('<mark>WORLD</mark>');
    });
  });

  describe('extractFragments', () => {
    it('should extract fragments around matches', () => {
      const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. The quick brown fox jumps over the lazy dog. Sed do eiusmod tempor incididunt.';
      const fragments = extractFragments(text, 'fox', { maxFragments: 1 });
      
      expect(fragments).toHaveLength(1);
      expect(fragments[0].text).toContain('<mark>fox</mark>');
    });
  });

  describe('createSnippet', () => {
    it('should create snippet with highlighted match', () => {
      const text = 'This is a long text that contains the keyword somewhere in the middle and continues for a while after that.';
      const snippet = createSnippet(text, 'keyword', 50);
      
      expect(snippet).toContain('<mark>keyword</mark>');
      expect(snippet.length).toBeLessThanOrEqual(60); // Accounting for tags
    });
  });

  describe('stripHighlights', () => {
    it('should remove highlight tags', () => {
      const highlighted = 'The <mark>quick</mark> brown <mark>fox</mark>';
      const stripped = stripHighlights(highlighted);
      
      expect(stripped).toBe('The quick brown fox');
    });
  });
});

describe('queryExpander', () => {
  describe('expandQuery', () => {
    it('should expand with synonyms', () => {
      const expanded = expandQuery('create a document');
      
      expect(expanded).toContain('create a document');
      expect(expanded.length).toBeGreaterThan(1);
      // Should include synonyms like 'make', 'build', etc.
      const hasSynonym = expanded.some(q => 
        q.includes('make') || q.includes('build') || q.includes('generate')
      );
      expect(hasSynonym).toBe(true);
    });

    it('should respect maxExpansions option', () => {
      const expanded = expandQuery('create', { maxExpansions: 1 });
      
      // Original + 1 expansion
      expect(expanded.length).toBeLessThanOrEqual(2);
    });
  });

  describe('extractKeywords', () => {
    it('should extract meaningful keywords', () => {
      const keywords = extractKeywords('What is the meaning of life and the universe?');
      
      expect(keywords).toContain('meaning');
      expect(keywords).toContain('life');
      expect(keywords).toContain('universe');
      expect(keywords).not.toContain('is');
      expect(keywords).not.toContain('the');
      expect(keywords).not.toContain('of');
    });
  });

  describe('parsePhrasesAndTerms', () => {
    it('should extract quoted phrases', () => {
      const { phrases, terms } = parsePhrasesAndTerms('"exact phrase" other words');
      
      expect(phrases).toContain('exact phrase');
      expect(terms).toContain('other');
      expect(terms).toContain('words');
    });

    it('should handle single quotes', () => {
      const { phrases } = parsePhrasesAndTerms("'another phrase' test");
      
      expect(phrases).toContain('another phrase');
    });
  });

  describe('buildTsQuery', () => {
    it('should build phrase query with proximity operator', () => {
      const query = buildTsQuery(['exact match'], ['term1', 'term2']);
      
      expect(query).toContain('exact <-> match');
      expect(query).toContain('term1');
      expect(query).toContain('term2');
    });

    it('should use OR operator when specified', () => {
      const query = buildTsQuery([], ['term1', 'term2'], 'or');
      
      expect(query).toBe('term1 | term2');
    });
  });
});
