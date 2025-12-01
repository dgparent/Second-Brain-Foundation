#!/usr/bin/env node

/**
 * Setup script for Second Brain Foundation monorepo
 * Creates the complete directory structure for all packages
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

// Define directory structure
const STRUCTURE = {
  packages: {
    core: {
      schemas: {},
      templates: {
        entities: {},
      },
      algorithms: {},
      structure: {},
    },
    cli: {
      src: {
        commands: {},
        lib: {},
      },
      bin: {},
      test: {},
    },
    shared: {
      types: {},
      utils: {},
    },
  },
  examples: {
    minimal: {},
    standard: {},
  },
  scripts: {},
};

function createDirectoryStructure(base, structure) {
  for (const [name, children] of Object.entries(structure)) {
    const dirPath = path.join(base, name);
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created ${path.relative(ROOT, dirPath)}`);
    }
    
    // Create .gitkeep if directory is empty
    if (Object.keys(children).length === 0) {
      const gitkeepPath = path.join(dirPath, '.gitkeep');
      if (!fs.existsSync(gitkeepPath)) {
        fs.writeFileSync(gitkeepPath, '');
      }
    } else {
      createDirectoryStructure(dirPath, children);
    }
  }
}

console.log('🏗️  Setting up Second Brain Foundation monorepo structure...\n');

createDirectoryStructure(ROOT, STRUCTURE);

console.log('\n✨ Setup complete!');
console.log('\nNext steps:');
console.log('  1. cd packages/cli');
console.log('  2. npm install');
console.log('  3. npm link');
console.log('  4. sbf --help\n');
