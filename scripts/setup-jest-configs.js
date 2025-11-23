#!/usr/bin/env node

/**
 * Generate Jest configuration files for all packages that don't have one
 */

const fs = require('fs');
const path = require('path');

const packages = [
  // Frameworks
  { name: '@sbf/financial-tracking', path: 'packages/@sbf/frameworks/financial-tracking' },
  { name: '@sbf/health-tracking', path: 'packages/@sbf/frameworks/health-tracking' },
  { name: '@sbf/knowledge-tracking', path: 'packages/@sbf/frameworks/knowledge-tracking' },
  { name: '@sbf/relationship-tracking', path: 'packages/@sbf/frameworks/relationship-tracking' },
  { name: '@sbf/task-management', path: 'packages/@sbf/frameworks/task-management' },
  
  // Plugins
  { name: '@sbf/va-dashboard', path: 'packages/@sbf/plugins/va-dashboard' },
  { name: '@sbf/budgeting', path: 'packages/@sbf/plugins/budgeting' },
  { name: '@sbf/fitness-tracking', path: 'packages/@sbf/plugins/fitness-tracking' },
  { name: '@sbf/portfolio-tracking', path: 'packages/@sbf/plugins/portfolio-tracking' },
  { name: '@sbf/nutrition-tracking', path: 'packages/@sbf/plugins/nutrition-tracking' },
  { name: '@sbf/medication-tracking', path: 'packages/@sbf/plugins/medication-tracking' },
  { name: '@sbf/learning-tracker', path: 'packages/@sbf/plugins/learning-tracker' },
  { name: '@sbf/highlights', path: 'packages/@sbf/plugins/highlights' },
  { name: '@sbf/healthcare', path: 'packages/@sbf/plugins/healthcare' },
  { name: '@sbf/agriculture', path: 'packages/@sbf/plugins/agriculture' },
  { name: '@sbf/legal', path: 'packages/@sbf/plugins/legal' },
];

const jestConfigTemplate = (displayName) => `/** @type {import('jest').Config} */
module.exports = {
  displayName: '${displayName}',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.test.ts', '<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
    }],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
`;

let created = 0;
let skipped = 0;

packages.forEach(pkg => {
  const jestConfigPath = path.join(process.cwd(), pkg.path, 'jest.config.js');
  
  if (fs.existsSync(jestConfigPath)) {
    console.log(`⏭️  Skipping ${pkg.name} - config already exists`);
    skipped++;
    return;
  }
  
  const packageDir = path.dirname(jestConfigPath);
  if (!fs.existsSync(packageDir)) {
    console.log(`⚠️  Skipping ${pkg.name} - directory doesn't exist`);
    skipped++;
    return;
  }
  
  fs.writeFileSync(jestConfigPath, jestConfigTemplate(pkg.name));
  console.log(`✅ Created Jest config for ${pkg.name}`);
  created++;
});

console.log(`\n📊 Summary: Created ${created}, Skipped ${skipped}`);
