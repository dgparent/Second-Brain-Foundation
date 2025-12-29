/**
 * Tests for OutputParser service.
 */

import { OutputParser, createOutputParser } from '../src/services/OutputParser';

describe('OutputParser', () => {
  let parser: OutputParser;
  
  beforeEach(() => {
    parser = createOutputParser();
  });
  
  describe('markdown parsing', () => {
    it('should clean markdown code blocks', () => {
      const content = '```markdown\n# Hello\n```';
      const result = parser.parse(content, 'markdown');
      
      expect(result.content).toBe('# Hello');
      expect(result.valid).toBe(true);
    });
    
    it('should handle plain markdown', () => {
      const content = '# Title\n\nContent here.';
      const result = parser.parse(content, 'markdown');
      
      expect(result.content).toBe('# Title\n\nContent here.');
      expect(result.valid).toBe(true);
    });
    
    it('should remove thinking tags', () => {
      const content = '<thinking>Internal reasoning</thinking>\n# Result';
      const result = parser.parse(content, 'markdown');
      
      expect(result.content).toBe('# Result');
    });
  });
  
  describe('JSON parsing', () => {
    it('should parse valid JSON', () => {
      const content = '{"key": "value"}';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ key: 'value' });
    });
    
    it('should extract JSON from code block', () => {
      const content = '```json\n{"key": "value"}\n```';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ key: 'value' });
    });
    
    it('should extract JSON object from text', () => {
      const content = 'Here is the result: {"key": "value"}';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ key: 'value' });
    });
    
    it('should extract JSON array', () => {
      const content = '[1, 2, 3]';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual([1, 2, 3]);
    });
    
    it('should handle invalid JSON', () => {
      const content = 'not valid json';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('No valid JSON found in output');
    });
    
    it('should remove thinking tags before parsing', () => {
      const content = '<think>reasoning</think>{"key": "value"}';
      const result = parser.parse(content, 'json');
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ key: 'value' });
    });
  });
  
  describe('schema validation', () => {
    const schema = {
      type: 'object',
      required: ['name', 'age'],
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    };
    
    it('should validate against schema', () => {
      const content = '{"name": "John", "age": 30}';
      const result = parser.parse(content, 'json', schema);
      
      expect(result.valid).toBe(true);
    });
    
    it('should detect schema violations', () => {
      const content = '{"name": "John"}'; // missing age
      const result = parser.parse(content, 'json', schema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some(e => e.includes('age'))).toBe(true);
    });
    
    it('should detect type mismatches', () => {
      const content = '{"name": "John", "age": "thirty"}'; // age should be number
      const result = parser.parse(content, 'json', schema);
      
      expect(result.valid).toBe(false);
    });
  });
  
  describe('structured parsing', () => {
    it('should parse structured output with schema', () => {
      const schema = {
        type: 'object',
        properties: {
          summary: { type: 'string' },
          points: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: true,
      };
      
      const content = '{"summary": "Test", "points": ["a", "b"]}';
      const result = parser.parse(content, 'structured', schema);
      
      expect(result.valid).toBe(true);
      expect(result.parsed).toEqual({ summary: 'Test', points: ['a', 'b'] });
    });
    
    it('should fall back to JSON parsing without schema', () => {
      const content = '{"key": "value"}';
      const result = parser.parse(content, 'structured');
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('validateSchema', () => {
    it('should validate valid data', () => {
      const schema = { type: 'object', properties: { x: { type: 'number' } } };
      const result = parser.validateSchema({ x: 1 }, schema);
      
      expect(result.valid).toBe(true);
    });
    
    it('should return errors for invalid data', () => {
      const schema = { type: 'object', properties: { x: { type: 'number' } } };
      const result = parser.validateSchema({ x: 'not a number' }, schema);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
  
  describe('repairJson', () => {
    it('should remove trailing commas', () => {
      const malformed = '{"key": "value",}';
      const repaired = parser.repairJson(malformed);
      
      expect(repaired).toBe('{"key": "value"}');
    });
    
    it('should fix unquoted keys', () => {
      const malformed = '{key: "value"}';
      const repaired = parser.repairJson(malformed);
      
      expect(repaired).toBe('{"key": "value"}');
    });
    
    it('should return null for unrepairable JSON', () => {
      const unrepairable = 'completely invalid';
      const repaired = parser.repairJson(unrepairable);
      
      expect(repaired).toBeNull();
    });
  });
  
  describe('extractFields', () => {
    it('should extract simple fields', () => {
      const data = { a: 1, b: 2, c: 3 };
      const extracted = parser.extractFields(data, ['a', 'c']);
      
      expect(extracted).toEqual({ a: 1, c: 3 });
    });
    
    it('should extract nested fields', () => {
      const data = { outer: { inner: 'value' } };
      const extracted = parser.extractFields(data, ['outer.inner']);
      
      expect(extracted).toEqual({ 'outer.inner': 'value' });
    });
    
    it('should handle missing fields', () => {
      const data = { a: 1 };
      const extracted = parser.extractFields(data, ['a', 'missing']);
      
      expect(extracted).toEqual({ a: 1 });
    });
    
    it('should handle non-object data', () => {
      const extracted = parser.extractFields('string', ['field']);
      
      expect(extracted).toEqual({});
    });
  });
});
