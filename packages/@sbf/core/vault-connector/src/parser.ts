import matter from 'gray-matter';
import { Entity, EntityType } from '@sbf/types';

export interface ParsedVaultFile {
  frontmatter: Record<string, any>;
  content: string;
  path: string;
}

export class MarkdownParser {
  parse(filePath: string, fileContent: string): ParsedVaultFile {
    const { data, content } = matter(fileContent);
    return {
      frontmatter: data,
      content,
      path: filePath
    };
  }

  toEntityInput(parsed: ParsedVaultFile): Partial<Entity> {
    const { frontmatter } = parsed;
    
    // Basic validation
    if (!frontmatter.type) {
      throw new Error(`File ${parsed.path} missing 'type' in frontmatter`);
    }

    return {
      type: frontmatter.type as EntityType,
      name: frontmatter.title || parsed.path.split('/').pop()?.replace('.md', '') || 'Untitled',
      description: frontmatter.description,
      metadata: frontmatter,
      // Additional mapping logic would go here
    };
  }
}
