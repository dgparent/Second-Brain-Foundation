/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Root configuration for monorepo
  projects: [
    '<rootDir>/packages/@sbf/*/jest.config.js',
  ],
  
  // Coverage configuration
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Test match patterns
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Module paths
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Transform files
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.base.json',
    }],
  },
  
  // Module name mapper for workspace packages
  moduleNameMapper: {
    '^@sbf/shared$': '<rootDir>/packages/@sbf/shared/src',
    '^@sbf/memory-engine$': '<rootDir>/packages/@sbf/memory-engine/src',
    '^@sbf/aei$': '<rootDir>/packages/@sbf/aei/src',
    '^@sbf/plugin-system$': '<rootDir>/packages/@sbf/core/plugin-system/src',
    '^@sbf/knowledge-graph$': '<rootDir>/packages/@sbf/core/knowledge-graph/src',
    '^@sbf/entity-manager$': '<rootDir>/packages/@sbf/core/entity-manager/src',
    '^@sbf/lifecycle-engine$': '<rootDir>/packages/@sbf/core/lifecycle-engine/src',
    '^@sbf/financial-tracking$': '<rootDir>/packages/@sbf/frameworks/financial-tracking/src',
    '^@sbf/health-tracking$': '<rootDir>/packages/@sbf/frameworks/health-tracking/src',
    '^@sbf/knowledge-tracking$': '<rootDir>/packages/@sbf/frameworks/knowledge-tracking/src',
    '^@sbf/relationship-tracking$': '<rootDir>/packages/@sbf/frameworks/relationship-tracking/src',
    '^@sbf/task-management$': '<rootDir>/packages/@sbf/frameworks/task-management/src',
  },
  
  // Global setup/teardown
  // globalSetup: '<rootDir>/jest.global-setup.js',
  // globalTeardown: '<rootDir>/jest.global-teardown.js',
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  
  // Verbose output
  verbose: true,
};