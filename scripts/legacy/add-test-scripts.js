#!/usr/bin/env node

/**
 * Add test scripts to all package.json files
 */

const fs = require('fs');
const path = require('path');

const packagePaths = [
  'packages/@sbf/shared',
  'packages/@sbf/memory-engine',
  'packages/@sbf/aei',
  'packages/@sbf/core/plugin-system',
  'packages/@sbf/core/knowledge-graph',
  'packages/@sbf/core/entity-manager',
  'packages/@sbf/core/lifecycle-engine',
  'packages/@sbf/frameworks/financial-tracking',
  'packages/@sbf/frameworks/health-tracking',
  'packages/@sbf/frameworks/knowledge-tracking',
  'packages/@sbf/frameworks/relationship-tracking',
  'packages/@sbf/frameworks/task-management',
  'packages/@sbf/plugins/va-dashboard',
  'packages/@sbf/plugins/budgeting',
  'packages/@sbf/plugins/fitness-tracking',
  'packages/@sbf/plugins/portfolio-tracking',
  'packages/@sbf/plugins/nutrition-tracking',
  'packages/@sbf/plugins/medication-tracking',
];

const testScripts = {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "test:ci": "jest --ci --coverage --maxWorkers=2"
};

let updated = 0;
let skipped = 0;

packagePaths.forEach(pkgPath => {
  const packageJsonPath = path.join(process.cwd(), pkgPath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⏭️  Skipping ${pkgPath} - package.json not found`);
    skipped++;
    return;
  }
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add or update test scripts
    packageJson.scripts = packageJson.scripts || {};
    Object.assign(packageJson.scripts, testScripts);
    
    // Write back to file with formatting
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Updated ${pkgPath}`);
    updated++;
  } catch (error) {
    console.error(`❌ Error updating ${pkgPath}:`, error.message);
    skipped++;
  }
});

console.log(`\n📊 Summary: Updated ${updated}, Skipped ${skipped}`);
