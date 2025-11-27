const fs = require('fs');
const path = require('path');

const modules = [
  // Personal Knowledge & Productivity
  'budgeting',
  'portfolio-tracking',
  'fitness-tracking',
  'medication-tracking',
  'nutrition-tracking',
  'learning-tracker',
  'highlights',
  'relationship-crm',
  'personal-tasks',
  'va-dashboard',
  
  // Industry Operations
  'agriculture',
  'healthcare',
  'legal-ops',
  'property-mgmt',
  'restaurant-haccp',
  'hospitality-ops',
  'logistics-ops',
  'insurance-ops',
  'construction-ops',
  'manufacturing-ops',
  'security-ops',
  'renewable-ops',
  'property-ops',
  'restaurant-haccp-ops'
];

const baseDir = path.join(__dirname, '../packages/@sbf/modules');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

modules.forEach(mod => {
  const modDir = path.join(baseDir, mod);
  if (!fs.existsSync(modDir)) {
    fs.mkdirSync(modDir);
    fs.mkdirSync(path.join(modDir, 'src'));
    
    // package.json
    const packageJson = {
      name: `@sbf/${mod}`,
      version: "0.1.0",
      main: "dist/index.js",
      types: "dist/index.d.ts",
      scripts: {
        "build": "tsc",
        "dev": "tsc --watch"
      },
      dependencies: {
        "@sbf/shared": "workspace:*"
      },
      devDependencies: {
        "typescript": "^5.9.3"
      }
    };
    fs.writeFileSync(path.join(modDir, 'package.json'), JSON.stringify(packageJson, null, 2));

    // tsconfig.json
    const tsconfig = {
      "extends": "../../../../tsconfig.base.json",
      "compilerOptions": {
        "outDir": "./dist",
        "rootDir": "./src",
        "composite": true
      },
      "include": ["src/**/*"]
    };
    fs.writeFileSync(path.join(modDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    // src/index.ts
    const indexTs = `export const MODULE_NAME = '@sbf/${mod}';\nexport function init() { console.log('Initializing ${mod} module'); }`;
    fs.writeFileSync(path.join(modDir, 'src/index.ts'), indexTs);
    
    console.log(`Scaffolding created for ${mod}`);
  } else {
    console.log(`Module ${mod} already exists, skipping.`);
  }
});
