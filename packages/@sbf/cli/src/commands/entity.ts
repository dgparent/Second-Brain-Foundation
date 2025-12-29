/**
 * Entity Command - Manage entities
 */

import { Command } from 'commander';
import { input, select, editor } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs/promises';
import { api } from '../utils/api.js';
import { formatTable, printEntity, success, error } from '../utils/output.js';
import { SensitivityLevel, EntityType } from '../types.js';

export const entityCommand = new Command('entity').description('Manage entities');

/**
 * sbf entity create
 */
entityCommand
  .command('create')
  .description('Create a new entity')
  .option('-t, --type <type>', 'Entity type')
  .option('-n, --name <name>', 'Entity title')
  .option('-c, --content <content>', 'Content')
  .option('-f, --file <file>', 'Read content from file')
  .option('-s, --sensitivity <level>', 'Sensitivity level')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const type =
      options.type ||
      (await select({
        message: 'Entity type:',
        choices: [
          { name: 'Note', value: 'note' },
          { name: 'Person', value: 'person' },
          { name: 'Place', value: 'place' },
          { name: 'Topic', value: 'topic' },
          { name: 'Project', value: 'project' },
          { name: 'Transitional', value: 'transitional' },
        ],
      }));

    const title =
      options.name ||
      (await input({
        message: 'Title:',
        validate: (v) => (v.length > 0 ? true : 'Title is required'),
      }));

    let content = options.content;
    if (options.file) {
      try {
        content = await fs.readFile(options.file, 'utf-8');
      } catch (e) {
        error(`Could not read file: ${options.file}`);
        return;
      }
    } else if (!content) {
      content = await editor({
        message: 'Content (opens editor):',
        default: `# ${title}\n\n`,
      });
    }

    const sensitivity =
      options.sensitivity ||
      (await select({
        message: 'Sensitivity:',
        choices: [
          { name: 'Public - Any AI can process', value: 'public' },
          { name: 'Personal - Local AI only (default)', value: 'personal' },
          { name: 'Confidential - No cloud AI', value: 'confidential' },
          { name: 'Secret - No AI processing', value: 'secret' },
        ],
        default: 'personal',
      }));

    console.log(chalk.blue('\nCreating entity...'));

    try {
      const entity = await api.createEntity({
        type,
        title,
        content,
        sensitivity: sensitivity as SensitivityLevel,
      });

      if (options.json) {
        console.log(JSON.stringify(entity, null, 2));
      } else {
        success(`Entity created: ${entity.uid}`);
      }
    } catch (e) {
      error(`Failed to create entity: ${(e as Error).message}`);
    }
  });

/**
 * sbf entity list
 */
entityCommand
  .command('list')
  .description('List entities')
  .option('-t, --type <type>', 'Filter by type')
  .option('-l, --limit <limit>', 'Limit results', '20')
  .option('-s, --search <query>', 'Search query')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const response = await api.listEntities({
        type: options.type,
        limit: parseInt(options.limit),
        search: options.search,
      });

      if (response.entities.length === 0) {
        console.log(chalk.yellow('No entities found.'));
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(response.entities, null, 2));
        return;
      }

      const table = formatTable(response.entities, [
        { key: 'uid', header: 'UID', width: 30 },
        { key: 'type', header: 'Type', width: 12 },
        { key: 'title', header: 'Title', width: 40 },
        { key: 'sensitivity', header: 'Privacy', width: 12 },
      ]);

      console.log(table);
      console.log(chalk.gray(`\nShowing ${response.entities.length} of ${response.total} entities`));
    } catch (e) {
      error(`Failed to list entities: ${(e as Error).message}`);
    }
  });

/**
 * sbf entity get <uid>
 */
entityCommand
  .command('get <uid>')
  .description('Get entity details')
  .option('--json', 'Output as JSON')
  .action(async (uid, options) => {
    try {
      const entity = await api.getEntity(uid);

      if (!entity) {
        error(`Entity not found: ${uid}`);
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(entity, null, 2));
      } else {
        printEntity(entity);
      }
    } catch (e) {
      error(`Failed to get entity: ${(e as Error).message}`);
    }
  });

/**
 * sbf entity update <uid>
 */
entityCommand
  .command('update <uid>')
  .description('Update an entity')
  .option('-n, --name <name>', 'New title')
  .option('-c, --content <content>', 'New content')
  .option('-f, --file <file>', 'Read content from file')
  .option('-s, --sensitivity <level>', 'New sensitivity')
  .action(async (uid, options) => {
    const updates: Record<string, unknown> = {};

    if (options.name) updates.title = options.name;
    if (options.sensitivity) updates.sensitivity = options.sensitivity;

    if (options.file) {
      try {
        updates.content = await fs.readFile(options.file, 'utf-8');
      } catch (e) {
        error(`Could not read file: ${options.file}`);
        return;
      }
    } else if (options.content) {
      updates.content = options.content;
    }

    if (Object.keys(updates).length === 0) {
      error('No updates specified. Use --name, --content, --file, or --sensitivity');
      return;
    }

    try {
      const entity = await api.updateEntity(uid, updates);
      success(`Entity updated: ${entity.uid}`);
    } catch (e) {
      error(`Failed to update entity: ${(e as Error).message}`);
    }
  });

/**
 * sbf entity delete <uid>
 */
entityCommand
  .command('delete <uid>')
  .description('Delete an entity')
  .option('-y, --yes', 'Skip confirmation')
  .action(async (uid, options) => {
    if (!options.yes) {
      const { confirm } = await import('@inquirer/prompts');
      const confirmed = await confirm({
        message: `Delete entity ${uid}?`,
        default: false,
      });
      if (!confirmed) return;
    }

    try {
      await api.deleteEntity(uid);
      success(`Entity deleted: ${uid}`);
    } catch (e) {
      error(`Failed to delete entity: ${(e as Error).message}`);
    }
  });
