import { MarkdownParser } from './parser';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  it('should parse frontmatter and content', () => {
    const content = `---
title: Test Note
type: note
---
# Hello World
This is a test.`;
    
    const result = parser.parse('/path/to/test.md', content);
    
    expect(result.frontmatter).toEqual({
      title: 'Test Note',
      type: 'note'
    });
    expect(result.content.trim()).toBe('# Hello World\nThis is a test.');
    expect(result.path).toBe('/path/to/test.md');
  });

  it('should convert to entity input', () => {
    const content = `---
title: My Project
type: project
description: A test project
---
`;
    const parsed = parser.parse('/vault/Projects/MyProject.md', content);
    const entity = parser.toEntityInput(parsed);

    expect(entity.type).toBe('project');
    expect(entity.name).toBe('My Project');
    expect(entity.description).toBe('A test project');
  });

  it('should throw error if type is missing', () => {
    const content = `---
title: Invalid Note
---
`;
    const parsed = parser.parse('/test.md', content);
    expect(() => parser.toEntityInput(parsed)).toThrow("missing 'type'");
  });
});
