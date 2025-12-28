/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@sbf/errors$': '<rootDir>/../errors/src/index.ts'
  },
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.test.ts', '!src/cli.ts'],
  coverageDirectory: 'coverage',
  verbose: true,
};
