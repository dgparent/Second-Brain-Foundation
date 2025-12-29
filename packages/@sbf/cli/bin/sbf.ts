#!/usr/bin/env node

/**
 * SBF CLI - Second Brain Foundation Command Line Interface
 *
 * A power-user CLI for managing your Second Brain Foundation instance.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  initCommand,
  entityCommand,
  searchCommand,
  chatCommand,
  syncCommand,
  migrateCommand,
} from '../src/commands/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read version from package.json
let version = '0.1.0';
try {
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  version = pkg.version;
} catch {
  // Use default
}

const program = new Command();

program
  .name('sbf')
  .description(
    chalk.blue(`
╔═══════════════════════════════════════════════════════╗
║  SBF CLI - Second Brain Foundation                    ║
║  A power-user interface for your knowledge system     ║
╚═══════════════════════════════════════════════════════╝
`)
  )
  .version(version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// Register commands
program.addCommand(initCommand);
program.addCommand(entityCommand);
program.addCommand(searchCommand);
program.addCommand(chatCommand);
program.addCommand(syncCommand);
program.addCommand(migrateCommand);

// Global options
program
  .option('--config <path>', 'Path to config file')
  .option('--json', 'Output in JSON format')
  .option('--quiet', 'Suppress non-essential output')
  .option('--debug', 'Enable debug output');

// Error handling
program.configureOutput({
  outputError: (str, write) => write(chalk.red(str)),
});

// Parse arguments
program.parseAsync(process.argv).catch((err) => {
  console.error(chalk.red(`Error: ${err.message}`));
  if (process.env.DEBUG || program.opts().debug) {
    console.error(err.stack);
  }
  process.exit(1);
});
