/**
 * Tests for FrontmatterParser
 */

import { FrontmatterParser } from '../src/parsers/FrontmatterParser';

describe('FrontmatterParser', () => {
  let parser: FrontmatterParser;
  
  beforeEach(() => {
    parser = new FrontmatterParser();
  });
  
  describe('parse', () => {
    it('should parse valid frontmatter', () => {
      const content = `---
uid: person-john-smith-001
type: person
name: John Smith
sensitivity: personal
truth_level: U1
relationships: []
created_at: "2024-01-01T00:00:00Z"
modified_at: "2024-01-02T00:00:00Z"
---

# John Smith

Some content about John.`;

      const { frontmatter, body } = parser.parse(content);
      
      expect(frontmatter).not.toBeNull();
      expect(frontmatter?.uid).toBe('person-john-smith-001');
      expect(frontmatter?.type).toBe('person');
      expect(frontmatter?.name).toBe('John Smith');
      expect(frontmatter?.sensitivity).toBe('personal');
      expect(frontmatter?.truth_level).toBe('U1');
      expect(frontmatter?.relationships).toEqual([]);
      expect(body).toBe('# John Smith\n\nSome content about John.');
    });
    
    it('should return null frontmatter for content without frontmatter', () => {
      const content = '# Just a heading\n\nSome content';
      const { frontmatter, body } = parser.parse(content);
      
      expect(frontmatter).toBeNull();
      expect(body).toBe(content);
    });
    
    it('should handle empty frontmatter', () => {
      const content = `---
---

Content`;
      const { frontmatter, body } = parser.parse(content);
      
      // Empty YAML returns null
      expect(body).toBe('Content');
    });
    
    it('should parse relationships array', () => {
      const content = `---
uid: person-john-smith-001
type: person
name: John
relationships:
  - target_uid: project-website-001
    type: works_on
    context: Lead developer
  - target_uid: topic-ai-042
    type: interested_in
created_at: "2024-01-01"
modified_at: "2024-01-01"
sensitivity: personal
truth_level: U1
---`;

      const { frontmatter } = parser.parse(content);
      
      expect(frontmatter?.relationships).toHaveLength(2);
      expect(frontmatter?.relationships[0]).toEqual({
        target_uid: 'project-website-001',
        type: 'works_on',
        context: 'Lead developer',
      });
    });
  });
  
  describe('hasFrontmatter', () => {
    it('should return true for content with frontmatter', () => {
      const content = `---
title: Test
---
Content`;
      expect(parser.hasFrontmatter(content)).toBe(true);
    });
    
    it('should return false for content without frontmatter', () => {
      expect(parser.hasFrontmatter('# Heading\n\nContent')).toBe(false);
      expect(parser.hasFrontmatter('---\nNot closed')).toBe(false);
    });
  });
  
  describe('generate', () => {
    it('should generate valid YAML frontmatter', () => {
      const data = {
        uid: 'person-jane-doe-001',
        type: 'person',
        name: 'Jane Doe',
        sensitivity: 'personal' as const,
        truth_level: 'U1' as const,
        relationships: [],
        created_at: '2024-01-01T00:00:00Z',
        modified_at: '2024-01-01T00:00:00Z',
      };
      
      const result = parser.generate(data);
      
      expect(result).toContain('---\n');
      expect(result).toContain('uid: person-jane-doe-001');
      expect(result).toContain('type: person');
      expect(result).toContain('name: Jane Doe');
      expect(result).toContain('---\n');
      
      // Should be parseable
      const { frontmatter } = parser.parse(result + '\n\nContent');
      expect(frontmatter?.uid).toBe('person-jane-doe-001');
    });
    
    it('should add empty relationships if not provided', () => {
      const data = {
        uid: 'person-test-001',
        type: 'person',
        name: 'Test',
      };
      
      const result = parser.generate(data);
      expect(result).toContain('relationships: []');
    });
  });
  
  describe('update', () => {
    it('should update frontmatter values', () => {
      const content = `---
uid: person-john-smith-001
type: person
name: John Smith
created_at: "2024-01-01"
modified_at: "2024-01-01"
relationships: []
sensitivity: personal
truth_level: U1
---

# John Smith`;

      const updated = parser.update(content, { name: 'John D. Smith' });
      const { frontmatter, body } = parser.parse(updated);
      
      expect(frontmatter?.name).toBe('John D. Smith');
      expect(frontmatter?.uid).toBe('person-john-smith-001'); // unchanged
      expect(body).toBe('# John Smith');
    });
    
    it('should update modified_at timestamp', () => {
      const content = `---
uid: test-001
modified_at: "2024-01-01"
---`;

      const updated = parser.update(content, {});
      const { frontmatter } = parser.parse(updated);
      
      expect(frontmatter?.modified_at).not.toBe('2024-01-01');
    });
  });
  
  describe('addRelationship', () => {
    it('should add new relationship', () => {
      const content = `---
uid: person-john-001
relationships: []
---
Content`;

      const updated = parser.addRelationship(content, {
        target_uid: 'project-test-001',
        type: 'works_on',
      });
      
      const { frontmatter } = parser.parse(updated);
      expect(frontmatter?.relationships).toHaveLength(1);
      expect(frontmatter?.relationships[0].target_uid).toBe('project-test-001');
    });
    
    it('should not add duplicate relationship', () => {
      const content = `---
uid: person-john-001
relationships:
  - target_uid: project-test-001
    type: works_on
---`;

      const updated = parser.addRelationship(content, {
        target_uid: 'project-test-001',
        type: 'works_on',
      });
      
      const { frontmatter } = parser.parse(updated);
      expect(frontmatter?.relationships).toHaveLength(1);
    });
  });
  
  describe('removeRelationship', () => {
    it('should remove existing relationship', () => {
      const content = `---
uid: person-john-001
relationships:
  - target_uid: project-a-001
    type: works_on
  - target_uid: project-b-001
    type: works_on
---`;

      const updated = parser.removeRelationship(content, 'project-a-001', 'works_on');
      const { frontmatter } = parser.parse(updated);
      
      expect(frontmatter?.relationships).toHaveLength(1);
      expect(frontmatter?.relationships[0].target_uid).toBe('project-b-001');
    });
  });
  
  describe('renderTemplate', () => {
    it('should replace placeholders with values', () => {
      const template = '# {{name}}\n\nUID: {{uid}}\nType: {{type}}';
      const data = {
        uid: 'person-test-001',
        type: 'person',
        name: 'Test Person',
        created_at: '2024-01-01',
        modified_at: '2024-01-01',
      };
      
      const result = parser.renderTemplate(template, data);
      
      expect(result).toBe('# Test Person\n\nUID: person-test-001\nType: person');
    });
    
    it('should keep placeholders for missing values', () => {
      const template = '{{name}} - {{missing}}';
      const data = {
        uid: 'test-001',
        type: 'test',
        name: 'Test',
        created_at: '',
        modified_at: '',
      };
      
      const result = parser.renderTemplate(template, data);
      expect(result).toBe('Test - {{missing}}');
    });
  });
  
  describe('validateRequired', () => {
    it('should validate required fields present', () => {
      const content = `---
uid: test-001
type: person
name: Test
---`;

      const result = parser.validateRequired(content, ['uid', 'type', 'name']);
      expect(result.valid).toBe(true);
      expect(result.missing).toEqual([]);
    });
    
    it('should report missing fields', () => {
      const content = `---
uid: test-001
---`;

      const result = parser.validateRequired(content, ['uid', 'type', 'name']);
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('type');
      expect(result.missing).toContain('name');
    });
    
    it('should handle content without frontmatter', () => {
      const result = parser.validateRequired('No frontmatter', ['uid']);
      expect(result.valid).toBe(false);
      expect(result.missing).toEqual(['uid']);
    });
  });
});
