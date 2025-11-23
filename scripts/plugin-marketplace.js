#!/usr/bin/env node
/**
 * Module Marketplace CLI
 * Search, install, and manage SBF Modules
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REGISTRY_URL = process.env.SBF_REGISTRY_URL || 'https://raw.githubusercontent.com/SecondBrainFoundation/sbf/main/module-registry.json';
const LOCAL_REGISTRY = path.join(__dirname, '..', 'module-registry.json');

async function fetchRegistry() {
  // Try local registry first
  if (fs.existsSync(LOCAL_REGISTRY)) {
    console.log('Using local Module registry...');
    return JSON.parse(fs.readFileSync(LOCAL_REGISTRY, 'utf-8'));
  }
  
  // Fallback to remote registry
  console.log('Fetching Module registry...');
  try {
    const https = require('https');
    return new Promise((resolve, reject) => {
      https.get(REGISTRY_URL, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });
  } catch (error) {
    console.error('Failed to fetch registry:', error.message);
    process.exit(1);
  }
}

async function listModules(filter) {
  const registry = await fetchRegistry();
  
  let Modules = registry.Modules;
  
  if (filter) {
    const search = filter.toLowerCase();
    Modules = Modules.filter(p => 
      p.name.toLowerCase().includes(search) ||
      p.description.toLowerCase().includes(search) ||
      (p.keywords && p.keywords.some(k => k.toLowerCase().includes(search))) ||
      (p.category && p.category.toLowerCase().includes(search))
    );
  }
  
  console.log(`\nAvailable Modules (${Modules.length}):\n`);
  
  for (const Module of Modules) {
    console.log(`📦 ${Module.name} v${Module.version}`);
    console.log(`   ${Module.description}`);
    if (Module.category) console.log(`   Category: ${Module.category}`);
    if (Module.framework?.length > 0) {
      console.log(`   Frameworks: ${Module.framework.join(', ')}`);
    }
    console.log('');
  }
}

async function showModule(ModuleId) {
  const registry = await fetchRegistry();
  const Module = registry.Modules.find(p => p.id === ModuleId || p.name === ModuleId);
  
  if (!Module) {
    console.error(`Module not found: ${ModuleId}`);
    process.exit(1);
  }
  
  console.log('\nModule Details:\n');
  console.log(`Name:        ${Module.name}`);
  console.log(`Version:     ${Module.version}`);
  console.log(`Description: ${Module.description}`);
  console.log(`Package ID:  ${Module.id}`);
  
  if (Module.author) console.log(`Author:      ${Module.author}`);
  if (Module.category) console.log(`Category:    ${Module.category}`);
  if (Module.license) console.log(`License:     ${Module.license}`);
  if (Module.homepage) console.log(`Homepage:    ${Module.homepage}`);
  if (Module.repository) console.log(`Repository:  ${Module.repository}`);
  
  if (Module.framework?.length > 0) {
    console.log(`\nRequires Frameworks:`);
    Module.framework.forEach(fw => console.log(`  - @sbf/frameworks/${fw}`));
  }
  
  if (Module.keywords?.length > 0) {
    console.log(`\nKeywords: ${Module.keywords.join(', ')}`);
  }
  
  console.log('');
}

async function installModule(ModuleId) {
  const registry = await fetchRegistry();
  const Module = registry.Modules.find(p => p.id === ModuleId || p.name === ModuleId);
  
  if (!Module) {
    console.error(`Module not found: ${ModuleId}`);
    process.exit(1);
  }
  
  console.log(`Installing ${Module.name} v${Module.version}...`);
  
  // Install framework dependencies first
  if (Module.framework?.length > 0) {
    console.log('\nInstalling framework dependencies...');
    for (const fw of Module.framework) {
      const fwPackage = `@sbf/frameworks/${fw}`;
      console.log(`  Installing ${fwPackage}...`);
      try {
        execSync(`npm install ${fwPackage}`, { stdio: 'inherit' });
      } catch (error) {
        console.error(`Failed to install ${fwPackage}`);
        process.exit(1);
      }
    }
  }
  
  // Install the Module
  console.log(`\nInstalling ${Module.id}...`);
  try {
    execSync(`npm install ${Module.id}`, { stdio: 'inherit' });
    console.log(`\n✓ Successfully installed ${Module.name}`);
  } catch (error) {
    console.error(`Failed to install ${Module.id}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
SBF Module Marketplace CLI

Usage:
  node scripts/Module-marketplace.js <command> [options]

Commands:
  list [filter]          List all available Modules (optionally filter)
  search <query>         Search for Modules by name, description, or keywords
  show <Module-id>       Show detailed information about a Module
  install <Module-id>    Install a Module and its dependencies
  help                   Show this help message

Examples:
  node scripts/Module-marketplace.js list
  node scripts/Module-marketplace.js search health
  node scripts/Module-marketplace.js show @sbf/modules/budgeting
  node scripts/Module-marketplace.js install @sbf/modules/fitness-tracking

Environment Variables:
  SBF_REGISTRY_URL      Override the Module registry URL
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      await listModules(args[1]);
      break;
    
    case 'search':
      if (!args[1]) {
        console.error('Usage: search <query>');
        process.exit(1);
      }
      await listModules(args[1]);
      break;
    
    case 'show':
      if (!args[1]) {
        console.error('Usage: show <Module-id>');
        process.exit(1);
      }
      await showModule(args[1]);
      break;
    
    case 'install':
      if (!args[1]) {
        console.error('Usage: install <Module-id>');
        process.exit(1);
      }
      await installModule(args[1]);
      break;
    
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    
    default:
      console.error(`Unknown command: ${command}\n`);
      showHelp();
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = { fetchRegistry, listModules, showModule, installModule };
