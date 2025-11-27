# Quick Fix Guide - Low-Hanging Fruit
**For Developers:** Quick wins to improve code quality

This document lists simple, high-impact improvements that can be done quickly.

---

## ⚡ 15-Minute Fixes

### 1. Add Package Description
**Files:** Various `package.json` files  
**Effort:** 2 min per package

Many packages are missing descriptions. Add a clear, concise description:

```json
{
  "name": "@sbf/example",
  "description": "Brief description of what this package does",
  ...
}
```

---

### 2. Add Missing Keywords
**Files:** Various `package.json` files  
**Effort:** 2 min per package

Add relevant keywords for package discovery:

```json
{
  "keywords": [
    "sbf",
    "second-brain",
    "specific-domain"
  ]
}
```

---

### 3. Fix Hardcoded Test Credential
**File:** `apps/api/src/routes/iot.routes.ts`  
**Effort:** 5 min

```typescript
// ❌ Bad
password: 'device-password'

// ✅ Good
password: config.iot.devicePassword || 'test-device-password'

// Add comment
password: config.iot.devicePassword || 'test-device-password' // Test credential only
```

---

### 4. Add File Headers
**Files:** TypeScript files without headers  
**Effort:** 2 min per file

Add consistent file headers:

```typescript
/**
 * @file ServiceName.ts
 * @description Brief description of what this file does
 * @module @sbf/package-name
 */
```

---

## ⚡ 30-Minute Fixes

### 5. Add README to Packages
**Files:** Packages without README.md  
**Effort:** 15-30 min per package

Template:
```markdown
# @sbf/package-name

Brief description of the package.

## Installation

\`\`\`bash
pnpm add @sbf/package-name
\`\`\`

## Usage

\`\`\`typescript
import { SomeClass } from '@sbf/package-name';

const instance = new SomeClass();
\`\`\`

## API

### ClassName

Description

#### Methods

- `methodName()` - Description

## License

MIT
```

---

### 6. Add Jest Configuration
**Files:** Packages with test script but no jest.config.js  
**Effort:** 15 min per package

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
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
```

---

### 7. Improve Error Messages
**Files:** Code with generic error messages  
**Effort:** 5 min per error

```typescript
// ❌ Bad
throw new Error('Error');

// ✅ Good
throw new Error('Failed to fetch user: Invalid user ID format');
```

---

### 8. Add Input Validation
**Files:** API endpoints without validation  
**Effort:** 10-20 min per endpoint

```typescript
// ❌ Bad
async createUser(req, res) {
  const user = await userService.create(req.body);
}

// ✅ Good
async createUser(req, res) {
  const { email, name } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }
  
  const user = await userService.create({ email, name });
}
```

---

## ⚡ 1-Hour Fixes

### 9. Replace console.log in a Package
**Effort:** 30-60 min per package

```typescript
// ❌ Bad
console.log('User created:', userId);
console.error('Failed to create user:', error);

// ✅ Good
import { logger } from '@sbf/logging';

logger.info('User created', { userId });
logger.error('Failed to create user', { error: error.message, stack: error.stack });
```

---

### 10. Add Basic Unit Tests
**Effort:** 30-60 min per class

Template:
```typescript
import { ClassName } from './ClassName';

describe('ClassName', () => {
  let instance: ClassName;

  beforeEach(() => {
    instance = new ClassName();
  });

  describe('methodName', () => {
    it('should return expected value when given valid input', () => {
      const result = instance.methodName('valid input');
      expect(result).toBe('expected output');
    });

    it('should throw error when given invalid input', () => {
      expect(() => instance.methodName(null)).toThrow();
    });
  });
});
```

---

### 11. Add Type Definitions
**Effort:** 30-60 min per file

```typescript
// ❌ Bad
function processData(data) {
  return data.map(item => item.value);
}

// ✅ Good
interface DataItem {
  value: string;
  id: number;
}

function processData(data: DataItem[]): string[] {
  return data.map(item => item.value);
}
```

---

### 12. Document Complex Functions
**Effort:** 10-30 min per function

```typescript
/**
 * Processes user transactions and calculates monthly summary
 * 
 * @param userId - The unique identifier of the user
 * @param startDate - Start date for the summary period (inclusive)
 * @param endDate - End date for the summary period (inclusive)
 * @returns Monthly transaction summary with totals and categorization
 * @throws {Error} If user is not found or date range is invalid
 * 
 * @example
 * ```typescript
 * const summary = await processTransactions(
 *   'user-123',
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 * console.log(summary.total); // Total amount for January
 * ```
 */
async function processTransactions(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<TransactionSummary> {
  // Implementation
}
```

---

## 🎯 Impact vs. Effort Matrix

| Fix | Effort | Impact | Priority |
|-----|--------|--------|----------|
| Add package descriptions | ⚡ | ⭐ | Low |
| Fix hardcoded credentials | ⚡ | ⭐⭐⭐ | High |
| Add file headers | ⚡ | ⭐ | Low |
| Add package READMEs | ⚡⚡ | ⭐⭐ | Medium |
| Add Jest configs | ⚡⚡ | ⭐⭐⭐ | High |
| Improve error messages | ⚡⚡ | ⭐⭐ | Medium |
| Add input validation | ⚡⚡ | ⭐⭐⭐ | High |
| Replace console.log | ⚡⚡⚡ | ⭐⭐⭐ | High |
| Add unit tests | ⚡⚡⚡ | ⭐⭐⭐⭐ | Critical |
| Add type definitions | ⚡⚡⚡ | ⭐⭐⭐ | High |
| Document functions | ⚡⚡ | ⭐⭐ | Medium |

**Legend:**
- ⚡ = 15 min
- ⚡⚡ = 30 min
- ⚡⚡⚡ = 1 hour
- ⭐ = Low impact
- ⭐⭐⭐⭐ = Critical impact

---

## 🚀 Getting Started

1. **Pick a fix** from the high-priority, low-effort section
2. **Find files** that need the fix (use grep/search)
3. **Make the change** following the examples
4. **Test** if applicable
5. **Commit** with clear message
6. **Repeat** for another quick win

---

## 💡 Pro Tips

### Before Making Changes

1. **Check for patterns** - Is this an issue across multiple files?
2. **Consider creating a script** - If fixing 10+ files, automate it
3. **Add to linter** - Prevent the issue from happening again

### After Making Changes

1. **Update this guide** - Mark completed items
2. **Document patterns** - Add to CONTRIBUTING.md
3. **Share learnings** - Update team on what you fixed

---

## 📝 Completed Fixes

Track your progress:

- [x] Added ESLint v9 configuration (Nov 27, 2025)
- [x] Added .editorconfig (Nov 27, 2025)
- [x] Added lint scripts to core packages (Nov 27, 2025)
- [ ] Fix hardcoded test credentials
- [ ] Add package descriptions to all packages
- [ ] Add README to packages without one
- [ ] Replace console.log in @sbf/api
- [ ] Replace console.log in @sbf/desktop
- [ ] Add unit tests to @sbf/db-client
- [ ] Add unit tests to @sbf/vector-client

---

**Tip:** Spend 15-30 minutes per day on quick fixes. You'll make significant progress over time!
