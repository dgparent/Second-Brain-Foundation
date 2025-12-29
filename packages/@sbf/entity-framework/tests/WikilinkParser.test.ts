/**
 * Tests for WikilinkParser
 */

import { WikilinkParser } from '../src/parsers/WikilinkParser';

describe('WikilinkParser', () => {
  let parser: WikilinkParser;
  
  beforeEach(() => {
    parser = new WikilinkParser();
  });
  
  describe('extract', () => {
    it('should extract simple wikilinks', () => {
      const content = 'See [[person-john-smith-001]] for details.';
      const links = parser.extract(content);
      
      expect(links).toHaveLength(1);
      expect(links[0].uid).toBe('person-john-smith-001');
      expect(links[0].displayText).toBeUndefined();
      expect(links[0].start).toBe(4);
      expect(links[0].end).toBe(29);
    });
    
    it('should extract wikilinks with display text', () => {
      const content = 'Contact [[person-john-smith-001|John Smith]] today.';
      const links = parser.extract(content);
      
      expect(links).toHaveLength(1);
      expect(links[0].uid).toBe('person-john-smith-001');
      expect(links[0].displayText).toBe('John Smith');
    });
    
    it('should extract multiple wikilinks', () => {
      const content = '[[person-john-001]] worked on [[project-website-001|Website]] with [[person-jane-002]].';
      const links = parser.extract(content);
      
      expect(links).toHaveLength(3);
      expect(links[0].uid).toBe('person-john-001');
      expect(links[1].uid).toBe('project-website-001');
      expect(links[1].displayText).toBe('Website');
      expect(links[2].uid).toBe('person-jane-002');
    });
    
    it('should handle content without wikilinks', () => {
      const content = 'No links here.';
      const links = parser.extract(content);
      
      expect(links).toHaveLength(0);
    });
    
    it('should trim whitespace from UIDs', () => {
      const content = '[[  person-john-001  ]]';
      const links = parser.extract(content);
      
      expect(links[0].uid).toBe('person-john-001');
    });
  });
  
  describe('extractUIDs', () => {
    it('should return unique UIDs', () => {
      const content = '[[person-john-001]] and [[person-john-001|John]] and [[project-test-001]]';
      const uids = parser.extractUIDs(content);
      
      expect(uids).toHaveLength(2);
      expect(uids).toContain('person-john-001');
      expect(uids).toContain('project-test-001');
    });
  });
  
  describe('count', () => {
    it('should count wikilinks', () => {
      const content = '[[a]] and [[b]] and [[c|See C]]';
      expect(parser.count(content)).toBe(3);
    });
    
    it('should return 0 for no links', () => {
      expect(parser.count('No links here')).toBe(0);
    });
  });
  
  describe('resolve', () => {
    it('should resolve wikilinks using resolver function', () => {
      const content = 'See [[person-john-001]] for details.';
      const resolver = (uid: string) => uid === 'person-john-001' ? 'John Smith' : null;
      
      const result = parser.resolve(content, resolver);
      expect(result).toBe('See John Smith for details.');
    });
    
    it('should keep original for unresolved links', () => {
      const content = 'See [[unknown-entity-001]] for details.';
      const resolver = () => null;
      
      const result = parser.resolve(content, resolver);
      expect(result).toBe('See [[unknown-entity-001]] for details.');
    });
    
    it('should use display text when available', () => {
      const content = 'See [[person-john-001|John]] for details.';
      const resolver = (uid: string) => 'John Smith';
      
      const result = parser.resolve(content, resolver);
      expect(result).toBe('See John for details.');
    });
  });
  
  describe('create', () => {
    it('should create simple wikilink', () => {
      expect(parser.create('person-john-001')).toBe('[[person-john-001]]');
    });
    
    it('should create wikilink with display text', () => {
      expect(parser.create('person-john-001', 'John')).toBe('[[person-john-001|John]]');
    });
    
    it('should not add display text if same as UID', () => {
      expect(parser.create('test', 'test')).toBe('[[test]]');
    });
  });
  
  describe('parseSingle', () => {
    it('should parse single wikilink', () => {
      const result = parser.parseSingle('[[person-john-001|John]]');
      
      expect(result).not.toBeNull();
      expect(result?.uid).toBe('person-john-001');
      expect(result?.displayText).toBe('John');
    });
    
    it('should return null for non-wikilink', () => {
      expect(parser.parseSingle('not a link')).toBeNull();
      expect(parser.parseSingle('[[partial')).toBeNull();
    });
  });
  
  describe('isValidUID', () => {
    it('should validate PRD-compliant UIDs', () => {
      expect(parser.isValidUID('person-john-smith-001')).toBe(true);
      expect(parser.isValidUID('project-website-redesign-042')).toBe(true);
      expect(parser.isValidUID('topic-ai-ml-1000')).toBe(true);
    });
    
    it('should reject invalid UIDs', () => {
      expect(parser.isValidUID('invalid')).toBe(false);
      expect(parser.isValidUID('Person-john-001')).toBe(false); // uppercase
      expect(parser.isValidUID('person-john-01')).toBe(false); // counter too short
      expect(parser.isValidUID('')).toBe(false);
      expect(parser.isValidUID('person--001')).toBe(false); // empty slug
    });
  });
  
  describe('isWikilink', () => {
    it('should identify wikilinks', () => {
      expect(parser.isWikilink('[[person-john-001]]')).toBe(true);
      expect(parser.isWikilink('[[test|Display]]')).toBe(true);
      expect(parser.isWikilink('  [[test]]  ')).toBe(true);
    });
    
    it('should reject non-wikilinks', () => {
      expect(parser.isWikilink('not a link')).toBe(false);
      expect(parser.isWikilink('[single brackets]')).toBe(false);
    });
  });
  
  describe('findAt', () => {
    it('should find link at position', () => {
      const content = 'See [[person-john-001]] for details.';
      
      // Position inside the link (index 10 is inside [[person-john-001]])
      const link = parser.findAt(content, 10);
      expect(link?.uid).toBe('person-john-001');
    });
    
    it('should return null for position outside links', () => {
      const content = 'See [[person-john-001]] for details.';
      
      const link = parser.findAt(content, 0);
      expect(link).toBeNull();
    });
  });
  
  describe('findBrokenLinks', () => {
    it('should find invalid UIDs', () => {
      const content = '[[person-john-001]] and [[invalid]] and [[also-bad]]';
      const broken = parser.findBrokenLinks(content);
      
      expect(broken).toHaveLength(2);
      expect(broken.map(l => l.uid)).toContain('invalid');
      expect(broken.map(l => l.uid)).toContain('also-bad');
    });
  });
  
  describe('replaceLink', () => {
    it('should replace specific link', () => {
      const content = '[[person-john-001]] and [[project-test-001]]';
      const result = parser.replaceLink(content, 'person-john-001', 'person-john-smith-001', 'John Smith');
      
      expect(result).toBe('[[person-john-smith-001|John Smith]] and [[project-test-001]]');
    });
    
    it('should preserve display text if not provided', () => {
      const content = '[[person-john-001|John]]';
      const result = parser.replaceLink(content, 'person-john-001', 'person-john-smith-001');
      
      expect(result).toBe('[[person-john-smith-001|John]]');
    });
  });
  
  describe('strip', () => {
    it('should remove wikilink syntax', () => {
      const content = 'See [[person-john-001|John]] for details.';
      expect(parser.strip(content)).toBe('See John for details.');
    });
    
    it('should use UID when no display text', () => {
      const content = 'See [[person-john-001]] for details.';
      expect(parser.strip(content)).toBe('See person-john-001 for details.');
    });
  });
  
  describe('escape/unescape', () => {
    it('should escape wikilink syntax', () => {
      const text = 'Use [[brackets]] for links';
      const escaped = parser.escape(text);
      expect(escaped).toBe('Use \\[\\[brackets\\]\\] for links');
    });
    
    it('should unescape', () => {
      const escaped = 'Use \\[\\[brackets\\]\\] for links';
      expect(parser.unescape(escaped)).toBe('Use [[brackets]] for links');
    });
  });
  
  describe('buildLinkMap', () => {
    it('should group links by UID', () => {
      const content = '[[person-john-001]] mentioned [[person-john-001|John]] and [[project-test-001]]';
      const map = parser.buildLinkMap(content);
      
      expect(map.get('person-john-001')).toHaveLength(2);
      expect(map.get('project-test-001')).toHaveLength(1);
    });
  });
  
  describe('getStats', () => {
    it('should return link statistics', () => {
      const content = '[[person-john-001]] [[person-john-001|John]] [[invalid]] [[project-test-001|Project]]';
      const stats = parser.getStats(content);
      
      expect(stats.total).toBe(4);
      expect(stats.unique).toBe(3);
      expect(stats.valid).toBe(2); // person-john-001 and project-test-001
      expect(stats.invalid).toBe(2); // invalid (twice via unique UIDs)
      expect(stats.withDisplayText).toBe(2);
    });
  });
});
