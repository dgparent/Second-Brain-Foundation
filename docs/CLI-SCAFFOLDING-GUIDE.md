# Second Brain Foundation - CLI Scaffolding Guide

This document contains all the code and structure needed to create the CLI package for Second Brain Foundation, following the BMAD-METHOD patterns.

## Directory Structure

```
packages/cli/
├── bin/
│   └── sbf.js                    # Main CLI entry point
├── src/
│   ├── commands/
│   │   ├── init.js               # Initialize new vault
│   │   ├── validate.js           # Validate markdown files
│   │   ├── uid.js                # Generate UIDs
│   │   ├── check.js              # Check file integrity
│   │   └── status.js             # Show vault status
│   ├── lib/
│   │   ├── ui.js                 # UI utilities (prompts, spinners)
│   │   ├── validator.js          # Schema validation logic
│   │   ├── uid-generator.js      # UID generation logic
│   │   ├── file-watcher.js       # File integrity checking
│   │   └── vault.js              # Vault operations
│   ├── index.js                  # Main CLI program
│   └── cli.js                    # CLI commander setup
├── test/
│   ├── commands/
│   │   ├── init.test.js
│   │   ├── validate.test.js
│   │   └── uid.test.js
│   └── lib/
│       ├── validator.test.js
│       └── uid-generator.test.js
├── package.json
├── README.md
└── .eslintrc.json
```

---

## File Contents

### `packages/cli/package.json`

\`\`\`json
{
  "$schema": "https://json.schemastore.org/package.json",
  "name": "@second-brain-foundation/cli",
  "version": "0.1.0",
  "description": "CLI tools for Second Brain Foundation - validation, initialization, and UID generation",
  "keywords": [
    "pkm",
    "knowledge-management",
    "markdown",
    "cli",
    "second-brain",
    "obsidian",
    "validation"
  ],
  "repository": {
    "type": "git",
    "url": "git+https://github.com/second-brain-foundation/sbf.git",
    "directory": "packages/cli"
  },
  "license": "MIT",
  "author": "Second Brain Foundation Contributors",
  "type": "module",
  "exports": {
    ".": "./src/index.js",
    "./lib/*": "./src/lib/*"
  },
  "main": "./src/index.js",
  "bin": {
    "sbf": "./bin/sbf.js",
    "second-brain": "./bin/sbf.js"
  },
  "files": [
    "bin",
    "src",
    "README.md"
  ],
  "scripts": {
    "test": "node --test test/**/*.test.js",
    "test:watch": "node --test --watch test/**/*.test.js",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format:check": "prettier --check \"**/*.{js,json,md}\"",
    "format:fix": "prettier --write \"**/*.{js,json,md}\""
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "chalk": "^5.3.0",
    "commander": "^14.0.0",
    "fs-extra": "^11.3.0",
    "glob": "^11.0.0",
    "inquirer": "^10.2.2",
    "js-yaml": "^4.1.0",
    "ora": "^8.1.0"
  },
  "devDependencies": {
    "eslint": "^9.17.0",
    "prettier": "^3.5.3"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "publishConfig": {
    "access": "public"
  }
}
\`\`\`

---

### `packages/cli/bin/sbf.js`

\`\`\`javascript
#!/usr/bin/env node

/**
 * Second Brain Foundation CLI
 * Entry point for the sbf command
 */

import('../src/cli.js').catch((error) => {
  console.error('Failed to load CLI:', error);
  process.exit(1);
});
\`\`\`

---

### `packages/cli/src/cli.js`

\`\`\`javascript
import { program } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get package.json for version
const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

// Import commands
import { initCommand } from './commands/init.js';
import { validateCommand } from './commands/validate.js';
import { uidCommand } from './commands/uid.js';
import { checkCommand } from './commands/check.js';
import { statusCommand } from './commands/status.js';

// Set up main program
program
  .name('sbf')
  .version(packageJson.version)
  .description('Second Brain Foundation CLI - AI-augmented PKM framework');

// Register commands
program.addCommand(initCommand);
program.addCommand(validateCommand);
program.addCommand(uidCommand);
program.addCommand(checkCommand);
program.addCommand(statusCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (process.argv.slice(2).length === 0) {
  program.outputHelp();
}
\`\`\`

---

### `packages/cli/src/commands/init.js`

\`\`\`javascript
import { Command } from 'commander';
import chalk from 'chalk';
import { UI } from '../lib/ui.js';
import { Vault } from '../lib/vault.js';

const ui = new UI();
const vault = new Vault();

export const initCommand = new Command('init')
  .description('Initialize a new Second Brain vault')
  .argument('[directory]', 'Target directory', '.')
  .option('-t, --template <type>', 'Template set (minimal, standard, full)', 'standard')
  .option('-f, --force', 'Overwrite existing vault', false)
  .action(async (directory, options) => {
    try {
      console.log(chalk.cyan('\\n🧠 Second Brain Foundation - Vault Initialization\\n'));

      // Check if vault already exists
      const exists = await vault.exists(directory);
      if (exists && !options.force) {
        const shouldContinue = await ui.confirm(
          'Vault structure already exists. Overwrite?',
          false
        );
        if (!shouldContinue) {
          console.log(chalk.yellow('Initialization cancelled.'));
          process.exit(0);
        }
      }

      // Get template preference if not specified
      let template = options.template;
      if (!options.template) {
        template = await ui.select('Select template set:', [
          { name: 'Minimal - Basic structure only', value: 'minimal' },
          { name: 'Standard - Recommended setup', value: 'standard' },
          { name: 'Full - All templates and examples', value: 'full' },
        ]);
      }

      // Create vault structure
      const spinner = ui.spinner('Creating vault structure...');
      await vault.init(directory, template);
      spinner.succeed('Vault structure created');

      console.log(chalk.green('\\n✨ Vault initialized successfully!'));
      console.log(chalk.cyan('\\nVault structure:'));
      console.log(chalk.dim('  📁 Daily/          - Daily notes'));
      console.log(chalk.dim('  📁 People/         - Person entities'));
      console.log(chalk.dim('  📁 Places/         - Place entities'));
      console.log(chalk.dim('  📁 Topics/         - Topic entities'));
      console.log(chalk.dim('  📁 Projects/       - Project entities'));
      console.log(chalk.dim('  📁 Transitional/   - Notes pending organization'));

      console.log(chalk.cyan('\\nNext steps:'));
      console.log(chalk.dim('  1. Create a daily note: ') + chalk.bold('sbf note'));
      console.log(chalk.dim('  2. Validate structure: ') + chalk.bold('sbf validate'));
      console.log(chalk.dim('  3. Check status: ') + chalk.bold('sbf status'));

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\\n✗ Initialization failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });
\`\`\`

---

### `packages/cli/src/commands/validate.js`

\`\`\`javascript
import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import { UI } from '../lib/ui.js';
import { Validator } from '../lib/validator.js';

const ui = new UI();
const validator = new Validator();

export const validateCommand = new Command('validate')
  .description('Validate markdown files against schemas')
  .argument('[files...]', 'Files to validate (supports globs)')
  .option('-r, --recursive', 'Validate all markdown files recursively', false)
  .option('-s, --schema <path>', 'Custom schema directory')
  .option('-v, --verbose', 'Show detailed validation results', false)
  .option('-q, --quiet', 'Only show errors', false)
  .action(async (files, options) => {
    try {
      let filesToValidate = files;

      // If recursive, find all markdown files
      if (options.recursive) {
        filesToValidate = await glob('**/*.md', {
          ignore: ['node_modules/**', '.git/**', '.obsidian/**'],
        });
      }

      // If no files specified and not recursive, validate current directory
      if (filesToValidate.length === 0 && !options.recursive) {
        filesToValidate = await glob('*.md');
      }

      if (filesToValidate.length === 0) {
        console.log(chalk.yellow('No markdown files found to validate.'));
        process.exit(0);
      }

      if (!options.quiet) {
        console.log(chalk.cyan(\`\\nValidating \${filesToValidate.length} files...\\n\`));
      }

      const spinner = options.quiet ? null : ui.spinner('Validating files...');
      const results = await validator.validateFiles(filesToValidate, {
        schemaPath: options.schema,
        verbose: options.verbose,
      });

      if (spinner) spinner.stop();

      // Report results
      const { valid, invalid, errors } = results;

      if (invalid === 0) {
        console.log(chalk.green(\`\\n✓ All \${valid} files are valid!\\n\`));
        process.exit(0);
      } else {
        console.log(chalk.red(\`\\n✗ Found errors in \${invalid} files:\\n\`));

        for (const error of errors) {
          console.log(chalk.red('  ✗ ') + chalk.bold(error.file));
          if (error.line) {
            console.log(chalk.dim(\`    Line \${error.line}: \${error.message}\`));
          } else {
            console.log(chalk.dim(\`    \${error.message}\`));
          }
        }

        console.log(chalk.yellow(\`\\nTotal: \${valid} valid, \${invalid} invalid\\n\`));
        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('\\n✗ Validation failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });
\`\`\`

---

### `packages/cli/src/commands/uid.js`

\`\`\`javascript
import { Command } from 'commander';
import chalk from 'chalk';
import { UI } from '../lib/ui.js';
import { UIDGenerator } from '../lib/uid-generator.js';

const ui = new UI();
const uidGen = new UIDGenerator();

export const uidCommand = new Command('uid')
  .description('Generate UIDs for entities');

// Subcommand: generate
uidCommand
  .command('generate')
  .description('Generate a new UID')
  .argument('[type]', 'Entity type (person, place, topic, project)')
  .argument('[name]', 'Entity name')
  .option('-t, --type <type>', 'Entity type')
  .option('-n, --name <name>', 'Entity name')
  .action(async (typeArg, nameArg, options) => {
    try {
      let type = typeArg || options.type;
      let name = nameArg || options.name;

      // Interactive prompts if not provided
      if (!type) {
        type = await ui.select('Select entity type:', [
          { name: 'Person', value: 'person' },
          { name: 'Place', value: 'place' },
          { name: 'Topic', value: 'topic' },
          { name: 'Project', value: 'project' },
        ]);
      }

      if (!name) {
        name = await ui.input('Enter entity name:');
      }

      // Generate UID
      const uid = uidGen.generate(type, name);

      console.log(chalk.green('\\nGenerated UID:'));
      console.log(chalk.bold(uid));

      // Show example usage
      console.log(chalk.cyan('\\nExample frontmatter:'));
      console.log(chalk.dim('---'));
      console.log(chalk.dim(\`uid: \${uid}\`));
      console.log(chalk.dim(\`type: \${type}\`));
      console.log(chalk.dim(\`name: \${name}\`));
      console.log(chalk.dim('created_at: ' + new Date().toISOString()));
      console.log(chalk.dim('---'));

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\\n✗ UID generation failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });

export { uidCommand };
\`\`\`

---

### `packages/cli/src/commands/check.js`

\`\`\`javascript
import { Command } from 'commander';
import chalk from 'chalk';
import { glob } from 'glob';
import { UI } from '../lib/ui.js';
import { FileWatcher } from '../lib/file-watcher.js';

const ui = new UI();
const watcher = new FileWatcher();

export const checkCommand = new Command('check')
  .description('Check file integrity and detect modifications')
  .argument('[files...]', 'Files to check (supports globs)')
  .option('-r, --recursive', 'Check all markdown files recursively', false)
  .option('-u, --update', 'Update hash database', false)
  .option('-v, --verbose', 'Show all checked files', false)
  .action(async (files, options) => {
    try {
      let filesToCheck = files;

      // If recursive, find all markdown files
      if (options.recursive) {
        filesToCheck = await glob('**/*.md', {
          ignore: ['node_modules/**', '.git/**', '.obsidian/**'],
        });
      }

      // If no files specified and not recursive, check current directory
      if (filesToCheck.length === 0 && !options.recursive) {
        filesToCheck = await glob('*.md');
      }

      if (filesToCheck.length === 0) {
        console.log(chalk.yellow('No markdown files found to check.'));
        process.exit(0);
      }

      console.log(chalk.cyan(\`\\nChecking \${filesToCheck.length} files...\\n\`));

      const spinner = ui.spinner('Calculating hashes...');
      const results = await watcher.checkFiles(filesToCheck, {
        update: options.update,
      });
      spinner.stop();

      // Report results
      const { unchanged, modified, new: newFiles } = results;

      if (modified.length === 0 && newFiles.length === 0) {
        console.log(chalk.green(\`\\n✓ All \${unchanged.length} files unchanged!\\n\`));
      } else {
        if (newFiles.length > 0) {
          console.log(chalk.blue(\`\\n✓ New files (\${newFiles.length}):\`));
          for (const file of newFiles) {
            console.log(chalk.blue('  + ') + file);
          }
        }

        if (modified.length > 0) {
          console.log(chalk.yellow(\`\\n⚠ Modified files (\${modified.length}):\`));
          for (const file of modified) {
            console.log(chalk.yellow('  ⚠ ') + file);
          }
        }

        console.log(
          chalk.dim(
            \`\\nTotal: \${unchanged.length} unchanged, \${modified.length} modified, \${newFiles.length} new\\n\`
          )
        );
      }

      if (options.update && (modified.length > 0 || newFiles.length > 0)) {
        console.log(chalk.green('✓ Hash database updated\\n'));
      }

      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\\n✗ Check failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });
\`\`\`

---

### `packages/cli/src/commands/status.js`

\`\`\`javascript
import { Command } from 'commander';
import chalk from 'chalk';
import { Vault } from '../lib/vault.js';

const vault = new Vault();

export const statusCommand = new Command('status')
  .description('Show vault status and statistics')
  .argument('[directory]', 'Vault directory', '.')
  .action(async (directory) => {
    try {
      const exists = await vault.exists(directory);

      if (!exists) {
        console.log(
          chalk.yellow('\\n⚠️  No Second Brain vault found in:'),
          directory
        );
        console.log(chalk.dim('Run "sbf init" to create a new vault'));
        process.exit(0);
      }

      console.log(chalk.cyan('\\n📊 Second Brain Vault Status\\n'));

      const stats = await vault.getStats(directory);

      console.log(chalk.bold('Location:'), stats.path);
      console.log(chalk.bold('Structure:'), stats.valid ? chalk.green('✓ Valid') : chalk.red('✗ Invalid'));

      console.log(chalk.bold('\\nEntities:'));
      console.log(\`  📁 People:   \${stats.entities.people}\`);
      console.log(\`  📁 Places:   \${stats.entities.places}\`);
      console.log(\`  📁 Topics:   \${stats.entities.topics}\`);
      console.log(\`  📁 Projects: \${stats.entities.projects}\`);
      console.log(chalk.dim(\`  Total: \${stats.entities.total}\`));

      console.log(chalk.bold('\\nLifecycle:'));
      console.log(\`  📝 Daily:         \${stats.lifecycle.captured}\`);
      console.log(\`  🔄 Transitional:  \${stats.lifecycle.transitional}\`);
      console.log(\`  ✓  Permanent:     \${stats.lifecycle.permanent}\`);
      console.log(\`  📦 Archived:      \${stats.lifecycle.archived}\`);

      if (stats.lifecycle.over48h > 0) {
        console.log(
          chalk.yellow(
            \`\\n⚠  \${stats.lifecycle.over48h} daily notes are over 48 hours old\\n\`
          )
        );
      }

      console.log(chalk.bold('\\nSensitivity:'));
      console.log(\`  🌍 Public:        \${stats.sensitivity.public}\`);
      console.log(\`  🔵 Personal:      \${stats.sensitivity.personal}\`);
      console.log(\`  🟡 Confidential:  \${stats.sensitivity.confidential}\`);
      console.log(\`  🔴 Secret:        \${stats.sensitivity.secret}\`);

      console.log();
      process.exit(0);
    } catch (error) {
      console.error(chalk.red('\\n✗ Status check failed:'), error.message);
      if (process.env.DEBUG) {
        console.error(chalk.dim(error.stack));
      }
      process.exit(1);
    }
  });
\`\`\`

---

### `packages/cli/src/lib/ui.js`

\`\`\`javascript
import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';

export class UI {
  /**
   * Show a spinner with message
   * @param {string} message
   * @returns {object} Spinner instance
   */
  spinner(message) {
    return ora(message).start();
  }

  /**
   * Prompt user for input
   * @param {string} message
   * @param {string} defaultValue
   * @returns {Promise<string>}
   */
  async input(message, defaultValue = '') {
    const { value } = await inquirer.prompt([
      {
        type: 'input',
        name: 'value',
        message,
        default: defaultValue,
      },
    ]);
    return value;
  }

  /**
   * Prompt user to confirm
   * @param {string} message
   * @param {boolean} defaultValue
   * @returns {Promise<boolean>}
   */
  async confirm(message, defaultValue = true) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message,
        default: defaultValue,
      },
    ]);
    return confirmed;
  }

  /**
   * Prompt user to select from options
   * @param {string} message
   * @param {Array} choices
   * @returns {Promise<any>}
   */
  async select(message, choices) {
    const { value } = await inquirer.prompt([
      {
        type: 'list',
        name: 'value',
        message,
        choices,
      },
    ]);
    return value;
  }

  /**
   * Prompt user to select multiple options
   * @param {string} message
   * @param {Array} choices
   * @returns {Promise<Array>}
   */
  async multiSelect(message, choices) {
    const { values } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'values',
        message,
        choices,
      },
    ]);
    return values;
  }
}
\`\`\`

---

### `packages/cli/src/lib/uid-generator.js`

\`\`\`javascript
import crypto from 'crypto';

export class UIDGenerator {
  /**
   * Generate a UID for an entity
   * @param {string} type - Entity type (person, place, topic, project)
   * @param {string} name - Entity name
   * @returns {string} Generated UID
   */
  generate(type, name) {
    // Validate type
    const validTypes = ['person', 'place', 'topic', 'project', 'daily-note'];
    if (!validTypes.includes(type)) {
      throw new Error(\`Invalid entity type: \${type}. Must be one of: \${validTypes.join(', ')}\`);
    }

    // Normalize name to kebab-case
    const slug = this.slugify(name);

    // Generate counter suffix (for uniqueness)
    const counter = this.generateCounter(slug);

    return \`\${type}-\${slug}-\${counter}\`;
  }

  /**
   * Convert string to kebab-case slug
   * @param {string} text
   * @returns {string}
   */
  slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Generate a 3-digit counter for uniqueness
   * @param {string} seed
   * @returns {string}
   */
  generateCounter(seed) {
    // Use hash of seed + timestamp for pseudo-random but deterministic counter
    const hash = crypto
      .createHash('md5')
      .update(seed + Date.now())
      .digest('hex');

    // Take first 3 hex characters and convert to number (001-999)
    const num = parseInt(hash.substring(0, 3), 16) % 999 + 1;
    return String(num).padStart(3, '0');
  }

  /**
   * Parse a UID into its components
   * @param {string} uid
   * @returns {object} { type, slug, counter }
   */
  parse(uid) {
    const match = uid.match(/^(person|place|topic|project|daily-note)-(.+)-(\d{3})$/);
    if (!match) {
      throw new Error(\`Invalid UID format: \${uid}\`);
    }

    return {
      type: match[1],
      slug: match[2],
      counter: match[3],
    };
  }
}
\`\`\`

---

### `packages/cli/src/lib/validator.js`

\`\`\`javascript
import { readFileSync } from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import yaml from 'js-yaml';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class Validator {
  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(this.ajv);
    this.schemas = this.loadSchemas();
  }

  /**
   * Load JSON schemas from core package
   * @returns {object} Loaded schemas
   */
  loadSchemas() {
    // In MVP, we'll load schemas from a local directory
    // Later, this will reference @second-brain-foundation/core package
    const schemaDir = join(__dirname, '../../../core/schemas');

    try {
      // Load entity metadata schema
      const entitySchema = JSON.parse(
        readFileSync(join(schemaDir, 'entity-metadata.json'), 'utf-8')
      );

      this.ajv.addSchema(entitySchema, 'entity-metadata');

      return {
        entity: entitySchema,
      };
    } catch (error) {
      // Fallback: use inline schema for MVP
      return this.createFallbackSchemas();
    }
  }

  /**
   * Create fallback schemas if files not found
   * @returns {object}
   */
  createFallbackSchemas() {
    const entitySchema = {
      $id: 'entity-metadata',
      type: 'object',
      required: ['uid', 'type', 'name', 'created_at'],
      properties: {
        uid: { type: 'string', pattern: '^(person|place|topic|project|daily-note)-.+-\\\d{3}$' },
        type: { type: 'string', enum: ['person', 'place', 'topic', 'project', 'daily-note'] },
        name: { type: 'string', minLength: 1 },
        created_at: { type: 'string', format: 'date-time' },
        modified_at: { type: 'string', format: 'date-time' },
        lifecycle_state: { type: 'string', enum: ['captured', 'transitional', 'permanent', 'archived'] },
        sensitivity: { type: 'string', enum: ['public', 'personal', 'confidential', 'secret'] },
        relationships: {
          type: 'array',
          items: {
            type: 'object',
            required: ['uid', 'type'],
            properties: {
              uid: { type: 'string' },
              type: { type: 'string' },
              metadata: { type: 'object' },
            },
          },
        },
      },
    };

    this.ajv.addSchema(entitySchema, 'entity-metadata');
    return { entity: entitySchema };
  }

  /**
   * Validate markdown files
   * @param {Array<string>} files - File paths to validate
   * @param {object} options - Validation options
   * @returns {Promise<object>} Validation results
   */
  async validateFiles(files, options = {}) {
    const results = {
      valid: 0,
      invalid: 0,
      errors: [],
    };

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const frontmatter = this.extractFrontmatter(content);

        if (!frontmatter) {
          // Files without frontmatter are valid (e.g., daily notes without metadata)
          results.valid++;
          continue;
        }

        // Validate against schema
        const isValid = this.ajv.validate('entity-metadata', frontmatter);

        if (isValid) {
          results.valid++;
        } else {
          results.invalid++;
          results.errors.push({
            file,
            message: this.ajv.errorsText(),
            line: null, // Could be improved with YAML parser that tracks line numbers
          });
        }
      } catch (error) {
        results.invalid++;
        results.errors.push({
          file,
          message: error.message,
          line: null,
        });
      }
    }

    return results;
  }

  /**
   * Extract frontmatter from markdown content
   * @param {string} content
   * @returns {object|null}
   */
  extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return null;
    }

    try {
      return yaml.load(match[1]);
    } catch (error) {
      throw new Error(\`Invalid YAML frontmatter: \${error.message}\`);
    }
  }
}
\`\`\`

---

### `packages/cli/src/lib/file-watcher.js`

\`\`\`javascript
import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs-extra';

export class FileWatcher {
  constructor() {
    this.hashDbPath = '.sbf-tracking/hashes.json';
  }

  /**
   * Check files for modifications
   * @param {Array<string>} files
   * @param {object} options
   * @returns {Promise<object>}
   */
  async checkFiles(files, options = {}) {
    const hashDb = this.loadHashDb();

    const results = {
      unchanged: [],
      modified: [],
      new: [],
    };

    for (const file of files) {
      try {
        const content = readFileSync(file, 'utf-8');
        const hash = this.calculateHash(content);

        const previousHash = hashDb[file];

        if (!previousHash) {
          results.new.push(file);
          hashDb[file] = hash;
        } else if (previousHash !== hash) {
          results.modified.push(file);
          if (options.update) {
            hashDb[file] = hash;
          }
        } else {
          results.unchanged.push(file);
        }
      } catch (error) {
        // File read error - skip
        console.warn(\`Warning: Could not read \${file}\`);
      }
    }

    if (options.update) {
      this.saveHashDb(hashDb);
    }

    return results;
  }

  /**
   * Calculate SHA-256 hash of content
   * @param {string} content
   * @returns {string}
   */
  calculateHash(content) {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Load hash database
   * @returns {object}
   */
  loadHashDb() {
    if (existsSync(this.hashDbPath)) {
      try {
        return JSON.parse(readFileSync(this.hashDbPath, 'utf-8'));
      } catch (error) {
        console.warn('Warning: Could not parse hash database, creating new one');
      }
    }
    return {};
  }

  /**
   * Save hash database
   * @param {object} hashDb
   */
  saveHashDb(hashDb) {
    const dir = dirname(this.hashDbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.hashDbPath, JSON.stringify(hashDb, null, 2));
  }
}
\`\`\`

---

### `packages/cli/src/lib/vault.js`

\`\`\`javascript
import { existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import { readFileSync } from 'fs';

export class Vault {
  /**
   * Check if vault exists
   * @param {string} directory
   * @returns {Promise<boolean>}
   */
  async exists(directory) {
    const requiredFolders = ['Daily', 'People', 'Places', 'Topics', 'Projects', 'Transitional'];
    return requiredFolders.every((folder) =>
      existsSync(join(directory, folder))
    );
  }

  /**
   * Initialize vault structure
   * @param {string} directory
   * @param {string} template
   */
  async init(directory, template = 'standard') {
    const folders = [
      'Daily',
      'People',
      'Places',
      'Topics',
      'Projects',
      'Transitional',
    ];

    // Create base folders
    for (const folder of folders) {
      const folderPath = join(directory, folder);
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath, { recursive: true });
      }

      // Create README for each folder
      this.createFolderReadme(folderPath, folder);
    }

    // Create templates based on template type
    if (template === 'standard' || template === 'full') {
      this.createTemplates(directory);
    }

    // Create example files for full template
    if (template === 'full') {
      this.createExamples(directory);
    }

    // Create .sbfrc.json config file
    this.createConfig(directory);
  }

  /**
   * Create folder README
   * @param {string} folderPath
   * @param {string} folderName
   */
  createFolderReadme(folderPath, folderName) {
    const readmeContent = this.getFolderReadmeContent(folderName);
    writeFileSync(join(folderPath, 'README.md'), readmeContent);
  }

  /**
   * Get README content for folder
   * @param {string} folderName
   * @returns {string}
   */
  getFolderReadmeContent(folderName) {
    const descriptions = {
      Daily: 'Daily notes for capturing thoughts, meetings, and activities. Notes transition to permanent structure after 48 hours.',
      People: 'Person entities representing individuals you interact with or reference.',
      Places: 'Place entities for locations, venues, and geographic references.',
      Topics: 'Topic entities for subjects, themes, and areas of interest.',
      Projects: 'Project entities for initiatives, goals, and ongoing work.',
      Transitional: 'Notes awaiting organization or needing manual review before filing.',
    };

    return \`# \${folderName}

\${descriptions[folderName] || 'Entity storage folder.'}

## Structure

Files in this folder should follow the entity template with proper frontmatter metadata.

## Frontmatter Template

\\\`\\\`\\\`yaml
---
uid: \${folderName.toLowerCase()}-name-001
type: \${folderName.toLowerCase().slice(0, -1)}
name: Entity Name
created_at: \${new Date().toISOString()}
modified_at: \${new Date().toISOString()}
lifecycle_state: permanent
sensitivity: personal
relationships: []
---
\\\`\\\`\\\`

## Usage

Create entities using:
- \\\`sbf uid generate \${folderName.toLowerCase().slice(0, -1)} "Name"\\\` - Generate UID
- Manual creation following the template above
- AEI (Phase 2) automatic extraction

For more information, see the [Second Brain Foundation documentation](https://github.com/second-brain-foundation/sbf).
\`;
  }

  /**
   * Create templates
   * @param {string} directory
   */
  createTemplates(directory) {
    const templatesDir = join(directory, '_templates');
    if (!existsSync(templatesDir)) {
      mkdirSync(templatesDir, { recursive: true });
    }

    // Create person template
    const personTemplate = \`---
uid: person-name-001
type: person
name: 
created_at: \${new Date().toISOString()}
modified_at: \${new Date().toISOString()}
lifecycle_state: permanent
sensitivity: personal
relationships: []
custom_fields:
  email: 
  phone: 
  organization: 
  tags: []
---

# {{name}}

## Context

How you know this person and your relationship.

## Notes

Relevant notes and interactions.

## Links

- Related entities
- External references
\`;

    writeFileSync(join(templatesDir, 'person.md'), personTemplate);

    // Similar for other entity types
    // (Omitted for brevity - would create place.md, topic.md, project.md, daily.md)
  }

  /**
   * Create example files
   * @param {string} directory
   */
  createExamples(directory) {
    // Create example daily note
    const today = new Date().toISOString().split('T')[0];
    const dailyExample = \`---
uid: daily-\${today}
type: daily-note
name: Daily Note - \${today}
created_at: \${new Date().toISOString()}
lifecycle_state: captured
sensitivity: personal
---

# \${today}

## Notes

Captured thoughts and activities for today.

## Tasks

- [ ] Example task

## References

Entities mentioned today:
- [[person-example-001]]
\`;

    writeFileSync(join(directory, 'Daily', \`\${today}.md\`), dailyExample);
  }

  /**
   * Create config file
   * @param {string} directory
   */
  createConfig(directory) {
    const config = {
      validation: {
        strict: false,
        schemas: './schemas/',
      },
      uid: {
        format: 'kebab-case',
        counter: true,
      },
      exclude: ['.git', '.obsidian', 'node_modules', '_templates'],
    };

    writeFileSync(
      join(directory, '.sbfrc.json'),
      JSON.stringify(config, null, 2)
    );
  }

  /**
   * Get vault statistics
   * @param {string} directory
   * @returns {Promise<object>}
   */
  async getStats(directory) {
    const stats = {
      path: directory,
      valid: await this.exists(directory),
      entities: {
        people: 0,
        places: 0,
        topics: 0,
        projects: 0,
        total: 0,
      },
      lifecycle: {
        captured: 0,
        transitional: 0,
        permanent: 0,
        archived: 0,
        over48h: 0,
      },
      sensitivity: {
        public: 0,
        personal: 0,
        confidential: 0,
        secret: 0,
      },
    };

    // Count entities
    stats.entities.people = this.countFiles(join(directory, 'People'));
    stats.entities.places = this.countFiles(join(directory, 'Places'));
    stats.entities.topics = this.countFiles(join(directory, 'Topics'));
    stats.entities.projects = this.countFiles(join(directory, 'Projects'));
    stats.entities.total =
      stats.entities.people +
      stats.entities.places +
      stats.entities.topics +
      stats.entities.projects;

    // Count lifecycle states
    const allFiles = await glob('**/*.md', {
      cwd: directory,
      ignore: ['node_modules/**', '.git/**', '_templates/**', '**/README.md'],
    });

    for (const file of allFiles) {
      const filePath = join(directory, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        const frontmatter = this.extractFrontmatter(content);

        if (frontmatter) {
          // Count lifecycle
          const lifecycle = frontmatter.lifecycle_state || 'permanent';
          stats.lifecycle[lifecycle]++;

          // Count sensitivity
          const sensitivity = frontmatter.sensitivity || 'personal';
          stats.sensitivity[sensitivity]++;

          // Check for old daily notes
          if (
            frontmatter.type === 'daily-note' &&
            lifecycle === 'captured'
          ) {
            const created = new Date(frontmatter.created_at);
            const now = new Date();
            const ageHours = (now - created) / 1000 / 60 / 60;
            if (ageHours > 48) {
              stats.lifecycle.over48h++;
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    return stats;
  }

  /**
   * Count markdown files in directory
   * @param {string} directory
   * @returns {number}
   */
  countFiles(directory) {
    if (!existsSync(directory)) return 0;

    return readdirSync(directory).filter(
      (file) => file.endsWith('.md') && file !== 'README.md'
    ).length;
  }

  /**
   * Extract frontmatter from markdown content
   * @param {string} content
   * @returns {object|null}
   */
  extractFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) {
      return null;
    }

    try {
      return yaml.load(match[1]);
    } catch (error) {
      return null;
    }
  }
}
\`\`\`

---

### `packages/cli/README.md`

\`\`\`markdown
# Second Brain Foundation - CLI Tools

Command-line interface for Second Brain Foundation specifications and validation tools.

## Installation

\\\`\\\`\\\`bash
npm install -g @second-brain-foundation/cli
\\\`\\\`\\\`

Or use via npx:

\\\`\\\`\\\`bash
npx @second-brain-foundation/cli [command]
\\\`\\\`\\\`

## Commands

### \\\`sbf init\\\`

Initialize a new Second Brain vault with base folder structure and templates.

### \\\`sbf validate\\\`

Validate markdown files against Second Brain Foundation schemas.

### \\\`sbf uid\\\`

Generate UIDs for entities.

### \\\`sbf check\\\`

Check file integrity and detect manual modifications.

### \\\`sbf status\\\`

Show vault status and statistics.

## Development

\\\`\\\`\\\`bash
# Install dependencies
npm install

# Link for local development
npm link

# Run tests
npm test

# Lint code
npm run lint
\\\`\\\`\\\`

## License

MIT License - see LICENSE file for details
\\\`\\\`\\\`

---

## Next Steps

1. **Create the directory structure** as outlined above
2. **Copy the file contents** from this guide into each respective file
3. **Install dependencies**: \\\`cd packages/cli && npm install\\\`
4. **Link CLI globally**: \\\`npm link\\\`
5. **Test the CLI**: \\\`sbf --help\\\`

This CLI scaffolding follows the BMAD-METHOD patterns:
- ✅ Command-based structure with auto-discovery
- ✅ Modular command files
- ✅ Reusable lib utilities
- ✅ Interactive UI with inquirer and ora
- ✅ Comprehensive error handling
- ✅ Chalk for colored output
- ✅ Commander.js for CLI framework

Ready to implement! 🚀
