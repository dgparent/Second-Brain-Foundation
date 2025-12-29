/**
 * Tests for UIDGenerator
 */

import { UIDGenerator } from '../src/services/UIDGenerator';
import type { DatabaseAdapter } from '../src/services/EntityTypeRegistry';

describe('UIDGenerator', () => {
  // Mock database adapter
  const mockDb: DatabaseAdapter = {
    query: jest.fn(),
    execute: jest.fn(),
  };
  
  let generator: UIDGenerator;
  
  beforeEach(() => {
    jest.clearAllMocks();
    generator = new UIDGenerator(mockDb);
  });
  
  describe('slugify', () => {
    it('should convert to lowercase', () => {
      expect(generator.slugify('John Smith')).toBe('john-smith');
    });
    
    it('should replace spaces with hyphens', () => {
      expect(generator.slugify('hello world')).toBe('hello-world');
    });
    
    it('should remove special characters', () => {
      expect(generator.slugify("John's Project!")).toBe('johns-project');
    });
    
    it('should handle accented characters', () => {
      expect(generator.slugify('Café München')).toBe('cafe-munchen');
    });
    
    it('should collapse multiple hyphens', () => {
      expect(generator.slugify('hello   world')).toBe('hello-world');
    });
    
    it('should trim leading/trailing hyphens', () => {
      expect(generator.slugify('  hello world  ')).toBe('hello-world');
    });
    
    it('should truncate long strings', () => {
      const longName = 'a'.repeat(100);
      expect(generator.slugify(longName).length).toBeLessThanOrEqual(50);
    });
  });
  
  describe('parseUID', () => {
    it('should parse valid UID', () => {
      const result = generator.parseUID('person-john-smith-001');
      expect(result).toEqual({
        type: 'person',
        slug: 'john-smith',
        counter: 1,
      });
    });
    
    it('should parse UID with longer counter', () => {
      const result = generator.parseUID('project-website-redesign-1234');
      expect(result).toEqual({
        type: 'project',
        slug: 'website-redesign',
        counter: 1234,
      });
    });
    
    it('should return null for invalid format', () => {
      expect(generator.parseUID('invalid')).toBeNull();
      expect(generator.parseUID('person-john')).toBeNull();
      expect(generator.parseUID('Person-john-001')).toBeNull(); // uppercase
    });
    
    it('should handle complex slugs', () => {
      const result = generator.parseUID('topic-ai-ml-deep-learning-042');
      expect(result).toEqual({
        type: 'topic',
        slug: 'ai-ml-deep-learning',
        counter: 42,
      });
    });
  });
  
  describe('isValidUID', () => {
    it('should return true for valid UIDs', () => {
      expect(generator.isValidUID('person-john-smith-001')).toBe(true);
      expect(generator.isValidUID('project-website-042')).toBe(true);
      expect(generator.isValidUID('topic-ai-1000')).toBe(true);
    });
    
    it('should return false for invalid UIDs', () => {
      expect(generator.isValidUID('invalid')).toBe(false);
      expect(generator.isValidUID('person-john')).toBe(false);
      expect(generator.isValidUID('Person-john-001')).toBe(false);
      expect(generator.isValidUID('person-john-01')).toBe(false); // counter too short
      expect(generator.isValidUID('')).toBe(false);
    });
  });
  
  describe('generateUID', () => {
    it('should generate PRD-compliant UID', async () => {
      // Mock database response
      (mockDb.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] }) // tenant check
        .mockResolvedValueOnce({ rows: [{ uid_counter: 1 }] }); // system type
      
      const uid = await generator.generateUID('tenant-123', 'person', 'John Smith');
      
      expect(uid).toBe('person-john-smith-001');
      expect(generator.isValidUID(uid)).toBe(true);
    });
    
    it('should throw for unknown entity type', async () => {
      (mockDb.query as jest.Mock)
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [] });
      
      await expect(
        generator.generateUID('tenant-123', 'unknown', 'Test')
      ).rejects.toThrow('Unknown entity type: unknown');
    });
  });
  
  describe('extractType', () => {
    it('should extract type from UID', () => {
      expect(generator.extractType('person-john-smith-001')).toBe('person');
      expect(generator.extractType('project-test-123')).toBe('project');
    });
    
    it('should return null for invalid UID', () => {
      expect(generator.extractType('invalid')).toBeNull();
    });
  });
  
  describe('normalizeUID', () => {
    it('should lowercase and trim', () => {
      expect(generator.normalizeUID('  Person-John-Smith-001  ')).toBe('person-john-smith-001');
    });
  });
});
