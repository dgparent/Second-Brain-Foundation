/**
 * Init Command - Initialize SBF in current directory
 */

import { Command } from 'commander';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { saveConfig, isInitialized } from '../config.js';
import { SBF_FOLDERS } from '../types.js';
import { api } from '../utils/api.js';
import { success, warning } from '../utils/output.js';

export const initCommand = new Command('init')
  .description('Initialize SBF in current directory')
  .option('-y, --yes', 'Skip prompts and use defaults')
  .option('-u, --url <url>', 'SBF API URL')
  .option('-k, --key <key>', 'API Key')
  .action(async (options) => {
    console.log(chalk.blue('🧠 Initializing Second Brain Foundation...\n'));

    const cwd = process.cwd();

    // Check if already initialized
    if (await isInitialized(cwd)) {
      warning('SBF already initialized in this directory.');

      if (!options.yes) {
        const reinit = await confirm({
          message: 'Reinitialize?',
          default: false,
        });
        if (!reinit) return;
      }
    }

    // Gather settings
    let apiUrl = options.url || 'https://api.secondbrainfoundation.com';
    let apiKey = options.key || '';

    if (!options.yes) {
      apiUrl = await input({
        message: 'SBF API URL:',
        default: apiUrl,
      });

      apiKey = await input({
        message: 'API Key (leave empty to configure later):',
        default: apiKey,
      });
    }

    // Save config
    await saveConfig({
      apiUrl,
      apiKey: apiKey || undefined,
      vaultPath: cwd,
      defaultSensitivity: 'personal',
    }, cwd);

    success('Configuration saved to .sbf/config.json');

    // Test connection if API key provided
    if (apiKey) {
      process.stdout.write('Testing connection... ');
      const connected = await api.testConnection();
      if (connected) {
        console.log(chalk.green('✓'));
      } else {
        console.log(chalk.red('✗'));
        warning('Could not connect to API. Check your URL and key.');
      }
    }

    // Create folder structure
    const createFolders =
      options.yes ||
      (await confirm({
        message: 'Create SBF folder structure?',
        default: true,
      }));

    if (createFolders) {
      console.log('');
      for (const folder of SBF_FOLDERS) {
        const folderPath = path.join(cwd, folder);
        try {
          await fs.mkdir(folderPath, { recursive: true });
          success(`Created ${folder}/`);
        } catch (e) {
          // Folder exists or error
        }
      }
    }

    // Add to gitignore
    try {
      const gitignorePath = path.join(cwd, '.gitignore');
      let gitignore = '';
      
      try {
        gitignore = await fs.readFile(gitignorePath, 'utf-8');
      } catch {
        // File doesn't exist
      }

      if (!gitignore.includes('.sbf/config.json')) {
        const addition = '\n# SBF\n.sbf/config.json\n';
        await fs.appendFile(gitignorePath, addition);
        success('Added .sbf/config.json to .gitignore');
      }
    } catch (e) {
      // Ignore gitignore errors
    }

    console.log(chalk.green('\n✅ SBF initialized successfully!'));
    console.log('\nNext steps:');
    
    if (!apiKey) {
      console.log('  1. Add your API key: ' + chalk.cyan('sbf config set apiKey YOUR_KEY'));
    }
    
    console.log('  ' + (apiKey ? '1' : '2') + '. Create your first entity: ' + chalk.cyan('sbf entity create'));
    console.log('  ' + (apiKey ? '2' : '3') + '. Start chatting: ' + chalk.cyan('sbf chat'));
  });
