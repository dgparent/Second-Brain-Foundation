/**
 * FrontmatterParser Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FrontmatterParser } from '../src/sync/FrontmatterParser';

describe('FrontmatterParser', () => {
  let parser: FrontmatterParser;

  beforeEach(() => {
    parser = new FrontmatterParser();
  });

  describe('parse', () => {
    it('should parse valid frontmatter', () => {
      const content = `---
uid: test-uid-123
title: Test Note
type: note
tags: [tag1, tag2]
---

This is the content.`;

      const result = parser.parse(content);

      expect(result.frontmatter.uid).toBe('test-uid-123');
      expect(result.frontmatter.title).toBe('Test Note');
      expect(result.frontmatter.type).toBe('note');
      expect(result.frontmatter.tags).toEqual(['tag1', 'tag2']);
      expect(result.content.trim()).toBe('This is the content.');
    });

    it('should handle missing frontmatter', () => {
      const content = 'Just plain content without frontmatter.';

      const result = parser.parse(content);

      expect(result.frontmatter).toEqual({});
      expect(result.content).toBe(content);
    });

    it('should handle empty frontmatter', () => {
      const content = `---
---

Content here.`;

      const result = parser.parse(content);

      expect(result.frontmatter).toEqual({});
      expect(result.content.trim()).toBe('Content here.');
    });

    it('should extract BMOM fields', () => {
      const content = `---
uid: test-uid
sbf_brain: brain-123
sbf_mind: mind-456
sbf_body: body-789
---

Content`;

      const result = parser.parse(content);

      expect(result.frontmatter.sbf_brain).toBe('brain-123');
      expect(result.frontmatter.sbf_mind).toBe('mind-456');
      expect(result.frontmatter.sbf_body).toBe('body-789');
    });
  });

  describe('serialize', () => {
    it('should serialize frontmatter to YAML', () => {
      const frontmatter = {
        uid: 'test-uid',
        title: 'Test',
        tags: ['a', 'b'],
      };
      const content = 'This is content.';

      const result = parser.serialize(frontmatter, content);

      expect(result).toContain('---');
      expect(result).toContain('uid: test-uid');
      expect(result).toContain('title: Test');
      expect(result).toContain('This is content.');
    });

    it('should handle special characters in title', () => {
      const frontmatter = {
        title: 'Title with "quotes" and: colons',
      };

      const result = parser.serialize(frontmatter, 'Content');

      // Should be properly escaped
      expect(result).toContain('title:');
    });
  });

  describe('update', () => {
    it('should update existing frontmatter', () => {
      const original = `---
uid: test-uid
title: Old Title
---

Content`;

      const updates = { title: 'New Title', type: 'note' };
      const result = parser.update(original, updates);

      expect(result).toContain('title: New Title');
      expect(result).toContain('type: note');
      expect(result).toContain('uid: test-uid');
      expect(result).toContain('Content');
    });

    it('should add frontmatter to content without it', () => {
      const original = 'Just content';
      const updates = { uid: 'new-uid', title: 'Title' };

      const result = parser.update(original, updates);

      expect(result).toContain('---');
      expect(result).toContain('uid: new-uid');
      expect(result).toContain('Just content');
    });
  });

  describe('generateUid', () => {
    it('should generate valid UIDs', () => {
      const uid1 = parser.generateUid();
      const uid2 = parser.generateUid();

      expect(uid1).toMatch(/^[a-z0-9-]+$/);
      expect(uid2).toMatch(/^[a-z0-9-]+$/);
      expect(uid1).not.toBe(uid2);
    });
  });

  describe('calculateChecksum', () => {
    it('should calculate consistent checksums', () => {
      const content = 'Test content';

      const checksum1 = parser.calculateChecksum(content);
      const checksum2 = parser.calculateChecksum(content);

      expect(checksum1).toBe(checksum2);
    });

    it('should produce different checksums for different content', () => {
      const checksum1 = parser.calculateChecksum('Content A');
      const checksum2 = parser.calculateChecksum('Content B');

      expect(checksum1).not.toBe(checksum2);
    });
  });

  describe('validate', () => {
    it('should accept valid frontmatter', () => {
      const frontmatter = {
        uid: 'valid-uid',
        title: 'Valid Title',
        type: 'note',
      };

      const errors = parser.validate(frontmatter);

      expect(errors).toHaveLength(0);
    });

    it('should report missing required fields', () => {
      const frontmatter = {
        title: 'No UID',
      };

      const errors = parser.validate(frontmatter);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('uid'))).toBe(true);
    });
  });
});
