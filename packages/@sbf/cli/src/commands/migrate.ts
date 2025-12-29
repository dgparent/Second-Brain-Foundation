/**
 * Migrate Command - Import/Export data
 */

import { Command } from 'commander';
import { select, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';
import { ObsidianImporter } from '../importers/ObsidianImporter.js';
import { NotionImporter } from '../importers/NotionImporter.js';
import { RoamImporter } from '../importers/RoamImporter.js';
import { NotebookLMExporter } from '../exporters/NotebookLMExporter.js';
import { success, error, warning, formatBytes } from '../utils/output.js';

export const migrateCommand = new Command('migrate').description('Import/export data');

/**
 * sbf migrate import
 */
migrateCommand
  .command('import')
  .description('Import from another tool')
  .option('-s, --source <source>', 'Source: obsidian, notion, roam')
  .option('-p, --path <path>', 'Path to import from')
  .option('--dry-run', 'Show what would be imported')
  .action(async (options) => {
    const source =
      options.source ||
      (await select({
        message: 'Import from:',
        choices: [
          { name: 'Obsidian Vault', value: 'obsidian' },
          { name: 'Notion Export (ZIP)', value: 'notion' },
          { name: 'Roam Export (JSON)', value: 'roam' },
        ],
      }));

    const importPath =
      options.path ||
      (await input({
        message: 'Path to import:',
        validate: (v) => (v.length > 0 ? true : 'Path is required'),
      }));

    const spinner = ora('Analyzing...').start();

    let importer;
    switch (source) {
      case 'obsidian':
        importer = new ObsidianImporter(importPath);
        break;
      case 'notion':
        importer = new NotionImporter(importPath);
        break;
      case 'roam':
        importer = new RoamImporter(importPath);
        break;
      default:
        spinner.fail('Unknown source');
        return;
    }

    try {
      // Analyze
      const analysis = await importer.analyze();
      spinner.stop();

      console.log(chalk.blue('\n📊 Analysis:'));
      console.log(`  Notes: ${analysis.noteCount}`);
      console.log(`  Folders: ${analysis.folderCount}`);
      console.log(`  Links: ${analysis.linkCount}`);
      console.log(`  Unique tags: ${analysis.uniqueTags.length}`);
      console.log(`  Est. entities: ${analysis.estimatedEntities}`);

      if (analysis.warnings?.length) {
        console.log(chalk.yellow('\n⚠️ Warnings:'));
        for (const w of analysis.warnings.slice(0, 5)) {
          console.log(chalk.gray(`  - ${w}`));
        }
      }

      if (options.dryRun) {
        warning('\n(Dry run - no changes made)');
        return;
      }

      const proceed = await confirm({
        message: `Import ${analysis.noteCount} notes?`,
        default: true,
      });

      if (!proceed) return;

      // Import
      const importSpinner = ora('Importing...').start();

      const result = await importer.import({
        onProgress: (current, total) => {
          importSpinner.text = `Importing... ${current}/${total}`;
        },
      });

      importSpinner.succeed(`Imported ${result.imported} entities`);

      if (result.skipped > 0) {
        warning(`${result.skipped} skipped`);
      }

      if (result.errors.length > 0) {
        console.log(chalk.yellow(`\n⚠️ ${result.errors.length} errors:`));
        for (const err of result.errors.slice(0, 5)) {
          console.log(chalk.gray(`  - ${err}`));
        }
        if (result.errors.length > 5) {
          console.log(chalk.gray(`  ... and ${result.errors.length - 5} more`));
        }
      }
    } catch (e) {
      spinner.stop();
      error(`Import failed: ${(e as Error).message}`);
    }
  });

/**
 * sbf migrate export
 */
migrateCommand
  .command('export')
  .description('Export to another format')
  .option('-f, --format <format>', 'Format: notebooklm, markdown, json')
  .option('-o, --output <path>', 'Output path')
  .option('-s, --sources <uids>', 'Source UIDs (comma-separated)')
  .action(async (options) => {
    const format =
      options.format ||
      (await select({
        message: 'Export format:',
        choices: [
          { name: 'NotebookLM-compatible', value: 'notebooklm' },
          { name: 'Markdown files', value: 'markdown' },
          { name: 'JSON', value: 'json' },
        ],
      }));

    const output =
      options.output ||
      (await input({
        message: 'Output path:',
        default: './sbf-export',
      }));

    const sourceUids = options.sources?.split(',').map((s: string) => s.trim());

    const spinner = ora('Exporting...').start();

    try {
      if (format === 'notebooklm') {
        const exporter = new NotebookLMExporter();
        const result = await exporter.export({
          outputPath: output,
          sourceUids,
          format: 'notebooklm',
        });

        spinner.succeed(`Exported ${result.fileCount} files (${formatBytes(result.totalSize)})`);
        console.log(chalk.gray('\nYou can now upload these files to NotebookLM.'));
      } else if (format === 'markdown') {
        const exporter = new NotebookLMExporter();
        const result = await exporter.export({
          outputPath: output,
          sourceUids,
          format: 'markdown',
        });

        spinner.succeed(`Exported ${result.fileCount} files (${formatBytes(result.totalSize)})`);
      } else if (format === 'json') {
        const exporter = new NotebookLMExporter();
        const result = await exporter.export({
          outputPath: output,
          sourceUids,
          format: 'json',
        });

        spinner.succeed(`Exported ${result.fileCount} files (${formatBytes(result.totalSize)})`);
      }
    } catch (e) {
      spinner.stop();
      error(`Export failed: ${(e as Error).message}`);
    }
  });
