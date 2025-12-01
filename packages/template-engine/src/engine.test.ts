import { TemplateEngine } from './engine';

describe('TemplateEngine', () => {
  let engine: TemplateEngine;

  beforeEach(() => {
    engine = new TemplateEngine();
  });

  it('should replace placeholders', () => {
    const template = '# {{title}}\nDate: {{formatDate date}}';
    const context = {
      title: 'My Project',
      date: new Date('2023-01-01').toISOString()
    };
    
    const result = engine.process(template, context);
    expect(result).toContain('# My Project');
    expect(result).toContain('Date: 2023-01-01');
  });

  it('should handle lowercase helper', () => {
    const template = '{{lowercase title}}';
    const context = { title: 'HELLO', date: '' };
    expect(engine.process(template, context)).toBe('hello');
  });
});
