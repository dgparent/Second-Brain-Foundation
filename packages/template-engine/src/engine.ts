import Handlebars from 'handlebars';
import { EntityType } from '@sbf/types';

export interface TemplateContext {
  title: string;
  date: string;
  [key: string]: any;
}

export class TemplateEngine {
  constructor() {
    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toISOString().split('T')[0];
    });
    
    Handlebars.registerHelper('lowercase', (str: string) => {
      return str.toLowerCase();
    });
  }

  process(templateContent: string, context: TemplateContext): string {
    const template = Handlebars.compile(templateContent);
    return template(context);
  }

  validate(content: string, type: EntityType): boolean {
    // TODO: Implement validation against ontology
    // Check if frontmatter contains required fields for the type
    return true;
  }
}
