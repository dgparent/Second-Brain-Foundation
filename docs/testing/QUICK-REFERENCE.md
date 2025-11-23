# Jest Testing - Quick Reference

## Quick Start

```bash
# Validate setup
npm run test:validate

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests (CI mode)
npm run test:ci
```

## Package-Specific Testing

```bash
# Navigate to package directory
cd packages/@sbf/core/module-system

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Common Tasks

### Create New Test File

```typescript
// src/__tests__/my-feature.test.ts
describe('MyFeature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
  
  it.todo('should handle edge case');
});
```

### Run Specific Test

```bash
npm test -- my-feature.test.ts
```

### Update Snapshots

```bash
npm test -- -u
```

### Clear Cache

```bash
npx jest --clearCache
```

### Debug Tests

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Coverage Targets

| Package | Target |
|---------|--------|
| memory-engine, aei | 70% |
| core packages | 60% |
| frameworks, modules | 50% |

## File Locations

- **Root config:** `jest.config.js`
- **Package configs:** `packages/@sbf/*/jest.config.js`
- **Test files:** `packages/@sbf/*/src/__tests__/*.test.ts`
- **Documentation:** `docs/testing/`
- **Scripts:** `scripts/setup-jest-configs.js`, `scripts/validate-jest-setup.js`

## Best Practices

1. Keep tests independent
2. Use descriptive test names
3. Follow Arrange-Act-Assert pattern
4. Mock external dependencies
5. Test edge cases
6. Keep tests fast (<100ms)
7. Use `.todo()` for planned tests

## Troubleshooting

### Module Not Found
Check `moduleNameMapper` in jest.config.js

### TypeScript Errors
Verify tsconfig.json is properly configured

### Timeout Issues
Increase timeout: `jest.setTimeout(10000)`

### Cache Issues
Clear cache: `npx jest --clearCache`

## Next Steps

1. Write tests for @sbf/shared
2. Add memory-engine tests with mocks
3. Implement AEI extraction tests
4. Create framework test suites
5. Build test utilities library

## Resources

- [Testing Guide](docs/testing/TESTING-GUIDE.md)
- [Setup Complete](docs/testing/SETUP-COMPLETE.md)
- [Implementation Summary](docs/testing/IMPLEMENTATION-SUMMARY.md)
- [Jest Docs](https://jestjs.io/)
- [ts-jest Docs](https://kulshekhar.github.io/ts-jest/)
