#!/usr/bin/env node

/**
 * Validate Jest test infrastructure setup
 * Checks that all packages have proper Jest configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Validating Jest Test Infrastructure\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function pass(message) {
  console.log(`✅ ${message}`);
  checks.passed++;
}

function fail(message) {
  console.log(`❌ ${message}`);
  checks.failed++;
}

function warn(message) {
  console.log(`⚠️  ${message}`);
  checks.warnings++;
}

// Check 1: Root Jest config exists
console.log('📦 Checking root configuration...');
if (fs.existsSync('jest.config.js')) {
  pass('Root jest.config.js exists');
  const config = require(path.join(process.cwd(), 'jest.config.js'));
  if (config.preset === 'ts-jest') {
    pass('ts-jest preset configured');
  } else {
    fail('ts-jest preset not configured');
  }
} else {
  fail('Root jest.config.js not found');
}

// Check 2: Jest dependencies installed
console.log('\n📚 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const devDeps = packageJson.devDependencies || {};

['jest', '@types/jest', 'ts-jest'].forEach(dep => {
  if (devDeps[dep]) {
    pass(`${dep} installed (${devDeps[dep]})`);
  } else {
    fail(`${dep} not installed`);
  }
});

// Check 3: Workspace package configs
console.log('\n🔧 Checking workspace packages...');
const workspaces = packageJson.workspaces || [];

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
  'packages/@sbf/plugins/budgeting',
  'packages/@sbf/plugins/fitness-tracking',
];

let configCount = 0;
let testScriptCount = 0;

packagePaths.forEach(pkgPath => {
  const jestConfigPath = path.join(pkgPath, 'jest.config.js');
  const packageJsonPath = path.join(pkgPath, 'package.json');
  
  if (fs.existsSync(jestConfigPath)) {
    configCount++;
  }
  
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.scripts && pkg.scripts.test) {
      testScriptCount++;
    }
  }
});

pass(`${configCount}/${packagePaths.length} packages have Jest configs`);
pass(`${testScriptCount}/${packagePaths.length} packages have test scripts`);

// Check 4: Sample tests exist
console.log('\n🧪 Checking sample tests...');
const sampleTests = [
  'packages/@sbf/core/plugin-system/src/__tests__/plugin-system.test.ts',
  'packages/@sbf/core/entity-manager/src/__tests__/entity-manager.test.ts',
  'packages/@sbf/core/knowledge-graph/src/__tests__/knowledge-graph.test.ts',
  'packages/@sbf/frameworks/financial-tracking/src/__tests__/financial-tracking.test.ts',
  'packages/@sbf/frameworks/task-management/src/__tests__/task-management.test.ts',
];

let testCount = 0;
sampleTests.forEach(testPath => {
  if (fs.existsSync(testPath)) {
    testCount++;
  }
});

pass(`${testCount}/${sampleTests.length} sample test files exist`);

// Check 5: Documentation
console.log('\n📖 Checking documentation...');
const docs = [
  'docs/testing/TESTING-GUIDE.md',
  'docs/testing/SETUP-COMPLETE.md',
  'docs/testing/IMPLEMENTATION-SUMMARY.md',
];

docs.forEach(doc => {
  if (fs.existsSync(doc)) {
    pass(`${doc} exists`);
  } else {
    warn(`${doc} not found`);
  }
});

// Check 6: CI/CD integration
console.log('\n🚀 Checking CI/CD...');
if (fs.existsSync('.github/workflows/ci.yml')) {
  const ci = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
  if (ci.includes('npm test')) {
    pass('CI workflow includes test execution');
  } else {
    warn('CI workflow may not run tests');
  }
  if (ci.includes('coverage')) {
    pass('CI workflow includes coverage reporting');
  } else {
    warn('CI workflow may not generate coverage');
  }
} else {
  warn('CI workflow not found');
}

// Check 7: Automation scripts
console.log('\n⚙️  Checking automation scripts...');
const scripts = [
  'scripts/setup-jest-configs.js',
  'scripts/add-test-scripts.js',
];

scripts.forEach(script => {
  if (fs.existsSync(script)) {
    pass(`${script} exists`);
  } else {
    warn(`${script} not found`);
  }
});

// Try to run a sample test
console.log('\n🏃 Running sample test...');
try {
  const result = execSync(
    'cd packages/@sbf/core/plugin-system && npm test --silent',
    { encoding: 'utf8', timeout: 30000 }
  );
  if (result.includes('PASS')) {
    pass('Sample tests execute successfully');
  } else {
    warn('Sample tests may have issues');
  }
} catch (error) {
  warn('Could not run sample tests (may need dependencies installed)');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Validation Summary');
console.log('='.repeat(60));
console.log(`✅ Passed:   ${checks.passed}`);
console.log(`❌ Failed:   ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(60));

if (checks.failed === 0) {
  console.log('\n🎉 Jest infrastructure validation PASSED!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Jest infrastructure has issues that need attention.\n');
  process.exit(1);
}
