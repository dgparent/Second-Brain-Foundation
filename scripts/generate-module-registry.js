#!/usr/bin/env node
/**
 * Module Registry Generator
 * Scans packages/@sbf/modules/ and generates module-registry.json
 */

const fs = require('fs');
const path = require('path');

const ModuleS_DIR = path.join(__dirname, '..', 'packages', '@sbf', 'Modules');
const OUTPUT_FILE = path.join(__dirname, '..', 'module-registry.json');

function scanModules() {
  const Modules = [];
  
  if (!fs.existsSync(ModuleS_DIR)) {
    console.error(`Modules directory not found: ${ModuleS_DIR}`);
    return Modules;
  }
  
  const ModuleDirs = fs.readdirSync(ModuleS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const ModuleDir of ModuleDirs) {
    const packageJsonPath = path.join(ModuleS_DIR, ModuleDir, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.warn(`Skipping ${ModuleDir}: no package.json found`);
      continue;
    }
    
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      
      // Extract framework dependencies
      const frameworks = [];
      const allDeps = { ...packageJson.dependencies, ...packageJson.peerDependencies };
      
      for (const dep of Object.keys(allDeps)) {
        if (dep.startsWith('@sbf/frameworks/')) {
          frameworks.push(dep.replace('@sbf/frameworks/', ''));
        }
      }
      
      const manifest = {
        id: packageJson.name || `@sbf/modules/${ModuleDir}`,
        name: packageJson.sbf?.displayName || packageJson.name,
        version: packageJson.version || '0.0.0',
        description: packageJson.description || '',
        author: packageJson.author,
        category: packageJson.sbf?.category,
        framework: frameworks.length > 0 ? frameworks : undefined,
        keywords: packageJson.keywords,
        repository: typeof packageJson.repository === 'string' 
          ? packageJson.repository 
          : packageJson.repository?.url,
        homepage: packageJson.homepage,
        license: packageJson.license,
        published: new Date().toISOString()
      };
      
      Modules.push(manifest);
      console.log(`✓ Registered Module: ${manifest.name} v${manifest.version}`);
      
    } catch (error) {
      console.error(`Error processing ${ModuleDir}:`, error.message);
    }
  }
  
  return Modules;
}

function generateRegistry() {
  console.log('Scanning Modules...\n');
  
  const Modules = scanModules();
  
  const registry = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    count: Modules.length,
    Modules
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(registry, null, 2));
  
  console.log(`\n✓ Generated registry with ${Modules.length} Modules`);
  console.log(`✓ Output: ${OUTPUT_FILE}`);
}

if (require.main === module) {
  generateRegistry();
}

module.exports = { scanModules, generateRegistry };
