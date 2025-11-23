# Testing Infrastructure

## Overview

The Second Brain Foundation uses Jest as the primary testing framework with TypeScript support via ts-jest. The testing infrastructure is designed for a monorepo architecture with individual test suites for each package.

## Quick Start

```bash
# Run all tests
npm test

# Run tests for a specific workspace
npm test --workspace=@sbf/module-system

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- module-system.test.ts
```

## Test Structure

### Directory Layout

```
packages/
├── @sbf/
│   ├── core/
│   │   ├── module-system/
│   │   │   ├── src/
│   │   │   │   ├── __tests__/
│   │   │   │   │   └── *.test.ts
│   │   │   │   └── *.ts
│   │   │   └── jest.config.js
│   │   ├── entity-manager/
│   │   ├── knowledge-graph/
│   │   └── lifecycle-engine/
│   ├── frameworks/
│   │   ├── financial-tracking/
│   │   ├── health-tracking/
│   │   ├── knowledge-tracking/
│   │   ├── relationship-tracking/
│   │   └── task-management/
│   └── modules/
│       ├── budgeting/
│       ├── fitness-tracking/
│       └── ...
└── jest.config.js (root)
```

### Test File Naming

- Unit tests: `*.test.ts`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.e2e.test.ts`

## Writing Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  describe('Sub-feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
    
    it.todo('should handle edge case');
  });
});
```

### Testing Async Code

```typescript
describe('Async Operations', () => {
  it('should handle promises', async () => {
    const result = await asyncFunction();
    expect(result).toBeDefined();
  });
  
  it('should handle errors', async () => {
    await expect(asyncFunctionThatThrows()).rejects.toThrow();
  });
});
```

### Mocking

```typescript
// Mock dependencies
jest.mock('@sbf/shared', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('With Mocks', () => {
  it('should use mocked dependencies', () => {
    // Test implementation
  });
});
```

## Configuration

### Root Configuration (`jest.config.js`)

The root Jest configuration manages the monorepo structure and provides shared settings for all packages.

Key features:
- Project-based configuration for multiple packages
- Shared coverage settings
- Module name mapping for workspace packages
- TypeScript transformation

### Package Configuration

Each package has its own `jest.config.js` with:
- Display name for test output
- Coverage thresholds specific to the package
- Custom test patterns (if needed)

## Coverage Thresholds

### Core Packages
- Branches: 60%
- Functions: 60%
- Lines: 60%
- Statements: 60%

### Frameworks & modules
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### Memory Engine & AEI
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## CI/CD Integration

### GitHub Actions Workflow

```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Descriptive Names**: Use clear, descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Follow the AAA pattern for clarity
4. **Mock External Dependencies**: Use mocks for external services, databases, and APIs
5. **Test Edge Cases**: Include tests for error conditions, boundary values, and edge cases
6. **Keep Tests Fast**: Avoid unnecessary delays; use mocks instead of real services
7. **Use `.todo()`**: Mark planned tests with `.todo()` to track test coverage gaps

## Test Categories

### Unit Tests
- Test individual functions and classes in isolation
- Mock all external dependencies
- Fast execution (<100ms per test)

### Integration Tests
- Test interaction between multiple modules
- May use in-memory databases or test containers
- Moderate execution time

### E2E Tests
- Test complete workflows end-to-end
- Use real services (in test environment)
- Slower execution

## Debugging Tests

### VS Code Configuration

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Current File",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": [
    "${fileBasenameNoExtension}",
    "--config",
    "jest.config.js"
  ],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

### Command Line Debugging

```bash
# Debug a specific test
node --inspect-brk node_modules/.bin/jest --runInBand specific-test.test.ts

# Then open chrome://inspect in Chrome
```

## Troubleshooting

### Common Issues

1. **Module not found**: Check `moduleNameMapper` in jest.config.js
2. **TypeScript errors**: Ensure tsconfig.json is properly configured
3. **Async timeouts**: Increase timeout with `jest.setTimeout(10000)`
4. **Cache issues**: Clear Jest cache with `npx jest --clearCache`

## Resources

- [Jest Documentation](https://jestjs.io/)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)
