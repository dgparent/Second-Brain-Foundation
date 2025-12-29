/**
 * Tests for TemplateRenderer service.
 */

import { TemplateRenderer, createTemplateRenderer } from '../src/services/TemplateRenderer';
import { TransformationContext } from '../src/types';

describe('TemplateRenderer', () => {
  let renderer: TemplateRenderer;
  
  beforeEach(() => {
    renderer = createTemplateRenderer();
  });
  
  describe('basic rendering', () => {
    it('should render simple template', () => {
      const template = 'Hello {{ name }}!';
      const result = renderer.render(template, { name: 'World' } as TransformationContext);
      
      expect(result.content).toBe('Hello World!');
    });
    
    it('should render template with nested variables', () => {
      const template = 'Source: {{ source.title }} ({{ source.type }})';
      const context: TransformationContext = {
        source: {
          id: '123',
          content: 'test',
          title: 'My Document',
          type: 'article',
        },
        tenantId: 'tenant-1',
      };
      
      const result = renderer.render(template, context);
      
      expect(result.content).toBe('Source: My Document (article)');
    });
    
    it('should estimate token count', () => {
      const template = '{{ content }}';
      const content = 'a'.repeat(100);
      const result = renderer.render(template, { content } as TransformationContext);
      
      expect(result.estimatedTokens).toBe(25); // 100 / 4
    });
  });
  
  describe('custom filters', () => {
    it('should truncate text', () => {
      const template = '{{ text | truncate(10) }}';
      const result = renderer.render(template, { text: 'Hello World!' } as TransformationContext);
      
      expect(result.content).toBe('Hello W...');
    });
    
    it('should count words', () => {
      const template = '{{ text | wordcount }}';
      const result = renderer.render(template, { text: 'Hello beautiful world' } as TransformationContext);
      
      expect(result.content).toBe('3');
    });
    
    it('should estimate tokens', () => {
      const template = '{{ text | tokencount }}';
      const result = renderer.render(template, { text: 'a'.repeat(100) } as TransformationContext);
      
      expect(result.content).toBe('25');
    });
    
    it('should extract first sentences', () => {
      const template = '{{ text | firstsentences(2) }}';
      const text = 'First sentence. Second sentence. Third sentence.';
      const result = renderer.render(template, { text } as TransformationContext);
      
      // Filter may include extra spacing between sentences
      expect(result.content.trim()).toMatch(/First sentence\.\s+Second sentence\./);
    });
    
    it('should clean text', () => {
      const template = '{{ text | cleantext }}';
      const text = '  Hello   world\n\n\n\nNew para  ';
      const result = renderer.render(template, { text } as TransformationContext);
      
      // Should normalize whitespace
      expect(result.content.trim()).toMatch(/Hello\s+world\s+New\s+para/);
    });
    
    it('should format as list', () => {
      const template = '{{ items | aslist }}';
      const result = renderer.render(template, { items: ['one', 'two', 'three'] } as TransformationContext);
      
      expect(result.content).toBe('- one\n- two\n- three');
    });
    
    it('should convert to JSON', () => {
      const template = '{{ obj | tojson }}';
      const obj = { key: 'value' };
      const result = renderer.render(template, { obj } as TransformationContext);
      
      expect(result.content).toBe('{\n  "key": "value"\n}');
    });
  });
  
  describe('conditionals and loops', () => {
    it('should handle if statements', () => {
      const template = '{% if show %}Visible{% endif %}';
      
      expect(renderer.render(template, { show: true } as TransformationContext).content).toBe('Visible');
      expect(renderer.render(template, { show: false } as TransformationContext).content).toBe('');
    });
    
    it('should handle for loops', () => {
      const template = '{% for item in items %}{{ item }},{% endfor %}';
      const result = renderer.render(template, { items: [1, 2, 3] } as TransformationContext);
      
      expect(result.content).toBe('1,2,3,');
    });
  });
  
  describe('globals', () => {
    it('should provide now() function', () => {
      const template = '{{ now() }}';
      const result = renderer.render(template, {} as TransformationContext);
      
      expect(result.content).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
    
    it('should provide today() function', () => {
      const template = '{{ today() }}';
      const result = renderer.render(template, {} as TransformationContext);
      
      expect(result.content).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });
  
  describe('validation', () => {
    it('should validate correct template', () => {
      const validation = renderer.validate('Hello {{ name }}');
      
      expect(validation.valid).toBe(true);
    });
    
    it('should detect syntax errors', () => {
      // Use unknown block tag which Nunjucks will reject
      const validation = renderer.validate('{% unknown_tag %}');
      
      expect(validation.valid).toBe(false);
      expect(validation.error).toBeDefined();
    });
  });
  
  describe('variable extraction', () => {
    it('should extract simple variables', () => {
      const vars = renderer.extractVariables('{{ name }} and {{ age }}');
      
      expect(vars).toContain('name');
      expect(vars).toContain('age');
    });
    
    it('should extract nested variables', () => {
      const vars = renderer.extractVariables('{{ source.title }}');
      
      expect(vars).toContain('source');
    });
    
    it('should extract variables from for loops', () => {
      const vars = renderer.extractVariables('{% for item in items %}{{ item }}{% endfor %}');
      
      expect(vars).toContain('items');
    });
    
    it('should extract variables from if statements', () => {
      const vars = renderer.extractVariables('{% if show %}content{% endif %}');
      
      expect(vars).toContain('show');
    });
  });
  
  describe('custom configuration', () => {
    it('should add custom filters', () => {
      const customRenderer = createTemplateRenderer({
        customFilters: {
          double: (n: unknown) => (typeof n === 'number' ? n * 2 : 0),
        },
      });
      
      const result = customRenderer.render('{{ num | double }}', { num: 5 } as TransformationContext);
      
      expect(result.content).toBe('10');
    });
    
    it('should handle strict mode', () => {
      const strictRenderer = createTemplateRenderer({ strict: true });
      
      expect(() => {
        strictRenderer.render('{{ undefined_var }}', {} as TransformationContext);
      }).toThrow();
    });
  });
});
