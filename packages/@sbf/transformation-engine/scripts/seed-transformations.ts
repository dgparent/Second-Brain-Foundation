/**
 * Seed script for built-in transformations.
 * 
 * Loads YAML templates and seeds them into the database.
 * Run: npx ts-node scripts/seed-transformations.ts
 */

import { loadBuiltInTemplates } from '../src/templates/loader';
import { TransformationRepository } from '../src/models/Transformation';

/**
 * Seed built-in transformations into the database.
 */
export async function seedTransformations(
  repo: TransformationRepository
): Promise<{ created: number; updated: number; errors: string[] }> {
  const templates = loadBuiltInTemplates();
  let created = 0;
  let updated = 0;
  const errors: string[] = [];
  
  console.log(`Found ${templates.length} built-in templates`);
  
  for (const template of templates) {
    try {
      // Check if transformation already exists
      const existing = await repo.findByName(template.name, null);
      
      if (existing) {
        // Update existing transformation
        const updated_transformation = {
          ...existing,
          description: template.description,
          promptTemplate: template.promptTemplate,
          outputFormat: template.outputFormat,
          outputSchema: template.outputSchema,
          modelId: template.modelId,
          temperature: template.temperature,
          maxTokens: template.maxTokens,
          applicableIngestionTypes: template.applicableIngestionTypes,
          version: existing.version + 1,
          updatedAt: new Date().toISOString(),
        };
        
        await repo.update(updated_transformation);
        updated++;
        console.log(`  Updated: ${template.name} (v${updated_transformation.version})`);
      } else {
        // Create new transformation
        await repo.create(template);
        created++;
        console.log(`  Created: ${template.name}`);
      }
    } catch (error) {
      const message = `Failed to seed ${template.name}: ${error instanceof Error ? error.message : 'Unknown'}`;
      errors.push(message);
      console.error(`  Error: ${message}`);
    }
  }
  
  console.log(`\nSeed complete: ${created} created, ${updated} updated, ${errors.length} errors`);
  
  return { created, updated, errors };
}

/**
 * List all built-in transformation templates.
 */
export function listTemplates(): void {
  const templates = loadBuiltInTemplates();
  
  console.log('\nBuilt-in Transformation Templates:\n');
  console.log('=' .repeat(60));
  
  for (const t of templates) {
    console.log(`\nName: ${t.name}`);
    console.log(`Description: ${t.description}`);
    console.log(`Output Format: ${t.outputFormat}`);
    console.log(`Model: ${t.modelId ?? 'default'}`);
    console.log(`Applicable To: ${t.applicableIngestionTypes.join(', ') || 'all'}`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${templates.length} templates`);
}

// CLI support
if (require.main === module) {
  const command = process.argv[2];
  
  if (command === 'list') {
    listTemplates();
  } else {
    console.log('Usage:');
    console.log('  npx ts-node scripts/seed-transformations.ts list  - List all templates');
    console.log('  Import and call seedTransformations(repo) to seed database');
  }
}
