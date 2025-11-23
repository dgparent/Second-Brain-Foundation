# Contributing to Second Brain Foundation

Thank you for contributing! 🎉 This guide covers our **module-based architecture**.

---

## 🚀 Quick Start

**What to contribute:**
1. **Build a module** (30-60 minutes) ← Most common
2. **Build a Framework** (2-4 hours)
3. **Improve Documentation**
4. **Report Bugs/Features**

---

## 🎯 Building a module

### 1. Choose a Framework

Current frameworks:
- `@sbf/financial-tracking` - Finance modules
- `@sbf/health-tracking` - Health & wellness modules
- `@sbf/knowledge-tracking` - Learning & knowledge modules

### 2. Set Up

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/SecondBrainFoundation.git
cd SecondBrainFoundation
npm install

# Create module directory
mkdir packages/@sbf/modules/your-module
cd packages/@sbf/modules/your-module
```

### 3. Create Structure

```
your-module/
├── src/
│   ├── YourEntity.ts     # Your custom entity
│   └── index.ts          # Public API
├── package.json
├── tsconfig.json
└── README.md
```

### 4. Extend Framework

**Example** (extending Knowledge Framework):

```typescript
// src/YourEntity.ts
import { KnowledgeNodeEntity, KnowledgeNodeMetadata } from '@sbf/knowledge-tracking';

export interface YourEntityMetadata extends KnowledgeNodeMetadata {
  // Add 15% custom fields
  your_custom_field: string;
}

export interface YourEntity extends KnowledgeNodeEntity {
  type: 'your.entity';
  metadata: YourEntityMetadata;
}

export function createYourEntity(
  title: string,
  options: Partial<YourEntityMetadata> = {}
): YourEntity {
  return {
    uid: `your-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'your.entity',
    title,
    metadata: {
      // 85% framework code (reused)
      content_type: 'concept',
      tags: [],
      status: 'to-review',
      times_reviewed: 0,
      created_date: new Date().toISOString(),
      modified_date: new Date().toISOString(),
      ease_factor: 2.5,
      interval_days: 1,
      consecutive_correct: 0,
      mastery_level: 0,
      
      // 15% your custom code
      your_custom_field: '',
      ...options
    }
  };
}
```

### 5. Configure package.json

```json
{
  "name": "@sbf/your-module",
  "version": "0.1.0",
  "description": "Your module description",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "@sbf/aei-core": "workspace:*",
    "@sbf/knowledge-tracking": "workspace:*"
  }
}
```

### 6. Create tsconfig.json

```json
{
  "extends": "../../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

### 7. Test

Create a test script (see `scripts/test-*-module.js` for examples).

### 8. Submit PR

1. Create feature branch: `git checkout -b feature/your-module`
2. Commit: `git commit -am "feat: add your module"`
3. Push: `git push origin feature/your-module`
4. Open Pull Request

---

## 🏗️ Building a Framework

Build a framework when you identify **3+ related modules** with 80%+ shared code.

### Structure

```
framework-name/
├── src/
│   ├── entities/       # Base entities
│   ├── workflows/      # Reusable logic
│   ├── helpers/        # Utility functions
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Process

1. Identify common patterns across 3+ use cases
2. Create base entities (80% shared)
3. Build reusable workflows
4. Add helper functions
5. Document API
6. Build 2 modules to validate reuse

**See:** [Framework Development Guide](docs/FRAMEWORK-DEVELOPMENT-GUIDE.md)

---

## 📏 Code Standards

### TypeScript

- Use strict mode
- Explicit return types
- Prefer interfaces for entities
- No `any` unless necessary

```typescript
// ✅ Good
interface EntityMetadata {
  uid: string;
  type: string;
}

function create(meta: EntityMetadata): Entity {
  return { ...meta };
}

// ❌ Bad
function create(meta: any) {
  return meta;
}
```

### Naming

- **Entities:** `PascalCase` + `Entity` suffix
- **Functions:** `camelCase`
- **Files:** `PascalCase.ts` (entities), `kebab-case.ts` (others)
- **Directories:** `kebab-case/`

### Organization

- One entity per file
- Group related files
- Keep files under 300 lines
- Use barrel exports (`index.ts`)

---

## 📤 Pull Request Process

### Checklist

- [ ] Code follows style guidelines
- [ ] Test script created
- [ ] Documentation added (README.md)
- [ ] package.json configured
- [ ] No sensitive data
- [ ] Clear commit messages

### Commit Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(module-name): add new entity
fix(framework): resolve bug
docs(guide): update examples
```

---

## 📝 Documentation

Document your module:

```markdown
# Your module Name

Brief description

## Features
- Feature 1
- Feature 2

## Usage
\```typescript
import { createYourEntity } from '@sbf/your-module';

const entity = createYourEntity('Title', { field: 'value' });
\```

## Entities
- **YourEntity** - Description

## Examples
See `scripts/test-your-module.js`
```

---

## 🐛 Reporting Issues

**Bug Report Template:**

```markdown
**Description**
Clear bug description

**Steps to Reproduce**
1. Step 1
2. Step 2

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [Windows/macOS/Linux]
- Node.js: [version]
```

**Feature Request Template:**

```markdown
**Feature Description**
What feature?

**Use Case**
What problem does this solve?

**Proposed Solution**
How might it work?
```

---

## 📚 Resources

### Documentation
- [module Development Guide](docs/module-DEVELOPMENT-GUIDE.md)
- [Framework Development Guide](docs/FRAMEWORK-DEVELOPMENT-GUIDE.md)
- [module Cluster Strategy](docs/module-CLUSTER-STRATEGY.md)
- [Project Handoff](docs/PROJECT-HANDOFF.md)

### Examples
- Financial Framework: `packages/@sbf/frameworks/financial-tracking/`
- Health Framework: `packages/@sbf/frameworks/health-tracking/`
- Knowledge Framework: `packages/@sbf/frameworks/knowledge-tracking/`
- modules: `packages/@sbf/modules/`

### Getting Help
- **Documentation:** Check `/docs` folder
- **Examples:** Browse `/packages/@sbf/modules/`
- **Discussions:** Use GitHub Discussions
- **Issues:** Report via GitHub Issues

---

## ✅ Before Submitting

- [ ] Code builds successfully
- [ ] Test script passes
- [ ] Documentation complete
- [ ] No TypeScript errors
- [ ] Follows naming conventions
- [ ] Package files configured correctly

---

## 🏆 Recognition

Contributors are:
- Listed in README
- Credited in module docs
- Added to CONTRIBUTORS file
- Mentioned in release notes

---

## 📄 License

By contributing, you agree your code will be licensed under MIT License.

---

## 🎉 Thank You!

Every contribution helps make Second Brain Foundation better for everyone!

**Need help?** Check docs or ask in Discussions. Happy contributing! 🚀

---

*For detailed guides, see [/docs](docs/) directory.*
