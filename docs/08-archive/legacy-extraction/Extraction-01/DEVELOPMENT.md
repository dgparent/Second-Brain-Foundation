# Second Brain Foundation - Development Guide

**Last Updated:** 2025-11-14  
**For:** Contributors, developers, and technical users  
**Repository:** Second Brain Foundation - Extraction-01  

---

## 🎯 Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | Runtime environment |
| **pnpm** | 8+ | Package manager (required for monorepo) |
| **Git** | 2.x | Version control |
| **VS Code** | Latest | Recommended IDE (optional) |
| **OS** | macOS / Windows / Linux | Cross-platform support |

### Installation

```bash
# 1. Navigate to the application directory
cd Extraction-01/03-integration/sbf-app

# 2. Install pnpm globally (if not already installed)
npm install -g pnpm

# 3. Install all dependencies
pnpm install

# 4. Build all packages
pnpm run build

# 5. Verify installation
pnpm run type-check
```

---

## 🏃 Running the Application

### Development Mode

```bash
# Start desktop app in development mode (hot reload enabled)
cd 03-integration/sbf-app
pnpm --filter @sbf/desktop dev
```

This starts:
- **Vite dev server** for renderer (React hot reload)
- **Electron** with Node.js debugging enabled
- **TypeScript** watch mode for main/preload

**Dev Tools:**
- Press `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux) for DevTools
- Main process logs appear in terminal
- Renderer logs appear in DevTools console

### Production Build

```bash
# Build all packages
pnpm run build

# Package for your platform
pnpm --filter @sbf/desktop build

# Output: dist/ folder with platform-specific installer
```

---

## 📁 Project Structure

```
Extraction-01/
├── 00-analysis/              # Library analysis docs
├── 00-archive/               # Historical progress logs
├── 01-extracted-raw/         # Raw extracted code from libraries
├── 02-refactored/            # Refactored TypeScript code
├── 03-integration/           # 🎯 MAIN APPLICATION
│   └── sbf-app/
│       ├── packages/
│       │   ├── core/             # @sbf/core - Backend logic
│       │   │   ├── src/
│       │   │   │   ├── filesystem/   # Vault operations
│       │   │   │   ├── entities/     # Entity management
│       │   │   │   ├── agent/        # AI agent (stub)
│       │   │   │   ├── relationships/# Graph (stub)
│       │   │   │   └── types/        # TypeScript types
│       │   │   ├── package.json
│       │   │   └── tsconfig.json
│       │   │
│       │   ├── desktop/          # @sbf/desktop - Electron app
│       │   │   ├── src/
│       │   │   │   ├── main/        # Electron main process
│       │   │   │   ├── preload/     # IPC bridge
│       │   │   │   └── renderer/    # React UI
│       │   │   ├── index.html
│       │   │   ├── package.json
│       │   │   └── vite.config.ts
│       │   │
│       │   └── ui/               # @sbf/ui - Shared components
│       │       ├── src/
│       │       ├── package.json
│       │       └── tsconfig.json
│       │
│       ├── package.json          # Root package.json
│       ├── pnpm-workspace.yaml   # pnpm workspace config
│       └── tsconfig.json         # Root TypeScript config
│
├── 04-documentation/         # Additional docs
├── scripts/                  # Build scripts
├── ARCHITECTURE.md           # Technical architecture
├── DEVELOPMENT.md            # This file
├── README.md                 # Project overview
└── IMPLEMENTATION-STATUS.md  # Current status
```

---

## 🛠️ Development Workflows

### Working on Core Logic (@sbf/core)

```bash
# Navigate to core package
cd packages/core

# Run TypeScript compiler in watch mode
pnpm run dev

# Run type checking
pnpm run type-check

# Build for production
pnpm run build
```

**Editing Core Modules:**
1. Edit files in `packages/core/src/`
2. TypeScript will recompile automatically
3. Restart Electron to see changes (no hot reload for main process yet)

### Working on Desktop UI (@sbf/desktop)

```bash
# Start dev server (from sbf-app root)
pnpm --filter @sbf/desktop dev

# Edit React components in packages/desktop/src/renderer/
# Changes hot reload automatically (no restart needed)
```

**UI Development Tips:**
- **React DevTools:** Install browser extension for better debugging
- **Component Inspector:** Right-click → Inspect Element
- **State Debugging:** Use React DevTools to inspect component state

### Working on IPC Handlers

**Main Process:**
- Edit `packages/desktop/src/main/index.ts`
- Add new IPC handlers
- Restart Electron to apply changes

**Preload:**
- Edit `packages/desktop/src/preload/index.ts`
- Update window API types in `packages/desktop/src/renderer/types/electron.d.ts`
- Restart Electron

**Renderer:**
- Use `window.api.*` to call IPC handlers
- TypeScript will autocomplete available methods

**Example:**
```typescript
// Main process (main/index.ts)
ipcMain.handle('vault:read-file', async (_event, filePath: string) => {
  return await vault.readFile(filePath);
});

// Preload (preload/index.ts)
contextBridge.exposeInMainWorld('api', {
  vault: {
    readFile: (path: string) => ipcRenderer.invoke('vault:read-file', path)
  }
});

// Renderer (React component)
const content = await window.api.vault.readFile('path/to/file.md');
```

---

## 🧪 Testing

### Unit Tests (Coming Soon)

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @sbf/core test

# Run tests in watch mode
pnpm --filter @sbf/core test:watch

# Generate coverage report
pnpm test:coverage
```

**Test Structure:**
```
packages/core/
├── src/
│   └── filesystem/
│       ├── vault.ts
│       └── vault.test.ts    # Tests alongside source
```

**Writing Tests:**
```typescript
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Vault } from './vault';

describe('Vault', () => {
  let vault: Vault;
  
  beforeEach(() => {
    vault = new Vault('/test/vault');
  });
  
  it('should validate paths correctly', () => {
    expect(() => vault.normalizePath('../../../etc/passwd')).toThrow();
  });
  
  it('should read files with frontmatter', async () => {
    const { content, frontmatter } = await vault.readFile('test.md');
    expect(frontmatter).toHaveProperty('uid');
  });
});
```

### Integration Tests (Coming Soon)

Test IPC communication between main and renderer:

```typescript
import { test, expect } from '@playwright/test';

test('create entity via IPC', async ({ page }) => {
  await page.goto('app://./index.html');
  
  const uid = await page.evaluate(async () => {
    return await window.api.entity.create('topic', {
      title: 'Test Topic',
      content: 'Test content'
    });
  });
  
  expect(uid).toMatch(/^topic-test-topic-\d+$/);
});
```

---

## 📝 Code Style Guide

### TypeScript

**Configuration:**
- Strict mode enabled
- No implicit any
- Explicit return types for public methods
- Interface over type alias (where applicable)

**Naming Conventions:**
```typescript
// Classes: PascalCase
class EntityFileManager { }

// Interfaces: PascalCase with 'I' prefix (optional)
interface AgentConfig { }

// Functions/Methods: camelCase
function createEntity() { }

// Constants: SCREAMING_SNAKE_CASE
const MAX_FILE_SIZE = 1024 * 1024;

// Private members: camelCase with '_' prefix
private _internalState: string;
```

**Class Structure:**
```typescript
export class MyClass {
  // 1. Static properties
  static readonly DEFAULT_CONFIG = { };
  
  // 2. Instance properties
  private _vault: Vault;
  public config: Config;
  
  // 3. Constructor
  constructor(vault: Vault) {
    this._vault = vault;
  }
  
  // 4. Public methods
  public async doSomething(): Promise<void> { }
  
  // 5. Private methods
  private helperMethod(): string { }
}
```

**Max Sizes:**
- **Class:** 200 LOC max (refactor if larger)
- **Function:** 50 LOC max (extract helpers if larger)
- **File:** 300 LOC max (split into multiple files if larger)

### React Components

**Component Structure:**
```typescript
import React, { useState, useEffect } from 'react';

interface MyComponentProps {
  title: string;
  onSave?: (data: string) => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, onSave }) => {
  // 1. State hooks
  const [data, setData] = useState<string>('');
  
  // 2. Effect hooks
  useEffect(() => {
    // Initialization
  }, []);
  
  // 3. Event handlers
  const handleSave = () => {
    if (onSave) {
      onSave(data);
    }
  };
  
  // 4. Render
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
```

**Naming:**
- Components: PascalCase
- Props interfaces: `{ComponentName}Props`
- Handlers: `handle{Action}` (e.g., `handleClick`)
- State setters: `set{StateName}` (e.g., `setIsOpen`)

### File Organization

**Imports Order:**
```typescript
// 1. Node.js built-ins
import path from 'path';
import fs from 'fs/promises';

// 2. External dependencies
import React from 'react';
import matter from 'gray-matter';

// 3. Internal modules (absolute imports)
import { Vault } from '@sbf/core/filesystem';
import { Entity } from '@sbf/core/types';

// 4. Relative imports
import { helperFunction } from './utils';
import './styles.css';
```

---

## 🔧 Common Development Tasks

### Adding a New Entity Type

**1. Update Types (`packages/core/src/types/entity.types.ts`):**
```typescript
export type EntityType = 
  | 'topic'
  | 'project'
  | 'person'
  | 'place'
  | 'daily-note'
  | 'my-new-type';  // Add here
```

**2. Update Folder Mapping (`packages/core/src/entities/entity-file-manager.ts`):**
```typescript
private getEntityFolder(type: EntityType): string {
  const folderMap: Record<EntityType, string> = {
    'topic': 'Knowledge',
    'project': 'Projects',
    'person': 'People',
    'place': 'Places',
    'daily-note': 'Capture/daily-notes',
    'my-new-type': 'MyNewFolder',  // Add here
  };
  return folderMap[type];
}
```

**3. Create Default Frontmatter (optional):**
```typescript
private getDefaultFrontmatter(type: EntityType): Partial<EntityFrontmatter> {
  if (type === 'my-new-type') {
    return {
      status: 'permanent',
      sensitivity: { level: 'personal' },
      // ... custom fields
    };
  }
  // ... existing logic
}
```

### Adding a New IPC Handler

**1. Main Process Handler (`packages/desktop/src/main/index.ts`):**
```typescript
ipcMain.handle('my-namespace:my-action', async (_event, arg1, arg2) => {
  try {
    const result = await someModule.doSomething(arg1, arg2);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

**2. Preload Exposure (`packages/desktop/src/preload/index.ts`):**
```typescript
contextBridge.exposeInMainWorld('api', {
  // ... existing namespaces
  myNamespace: {
    myAction: (arg1: string, arg2: number) => 
      ipcRenderer.invoke('my-namespace:my-action', arg1, arg2)
  }
});
```

**3. Update Types (`packages/desktop/src/renderer/types/electron.d.ts`):**
```typescript
export interface IElectronAPI {
  // ... existing
  myNamespace: {
    myAction: (arg1: string, arg2: number) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
}
```

**4. Use in Renderer:**
```typescript
const result = await window.api.myNamespace.myAction('test', 123);
if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Adding a New View

**1. Create Component (`packages/desktop/src/renderer/views/MyView.tsx`):**
```typescript
import React from 'react';
import './MyView.css';

export const MyView: React.FC = () => {
  return (
    <div className="my-view">
      <h1>My New View</h1>
    </div>
  );
};
```

**2. Update App Router (`packages/desktop/src/renderer/App.tsx`):**
```typescript
import { MyView } from './views/MyView';

type ViewType = 'chat' | 'entities' | 'graph' | 'queue' | 'settings' | 'my-view';

const viewMap: Record<ViewType, JSX.Element> = {
  // ... existing views
  'my-view': <MyView />
};
```

**3. Add Sidebar Item (`packages/desktop/src/renderer/components/Sidebar.tsx`):**
```typescript
<button onClick={() => onNavigate('my-view')}>
  My View
</button>
```

---

## 🐛 Debugging

### Main Process Debugging

**VS Code Launch Configuration (`.vscode/launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Electron Main",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceFolder}/03-integration/sbf-app",
      "runtimeExecutable": "${workspaceFolder}/03-integration/sbf-app/node_modules/.bin/electron",
      "args": ["./packages/desktop"],
      "outputCapture": "std"
    }
  ]
}
```

**Debugging Steps:**
1. Set breakpoints in main process code
2. Press F5 in VS Code
3. Electron starts with debugger attached

### Renderer Debugging

**Chrome DevTools:**
1. Start app in dev mode: `pnpm --filter @sbf/desktop dev`
2. Press `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux)
3. Use Console, Sources, Network tabs as needed

**React DevTools:**
1. Install React DevTools extension in Chrome
2. DevTools should automatically detect React app
3. Use Components and Profiler tabs

### Common Issues

**Issue:** Changes not appearing after edit  
**Solution:** 
- Renderer: Should hot reload (check Vite console for errors)
- Main/Preload: Restart Electron (Ctrl+C and run dev again)

**Issue:** `Module not found` error  
**Solution:**
- Run `pnpm install` in sbf-app root
- Check import paths are correct
- Verify package.json exports are configured

**Issue:** IPC handler not responding  
**Solution:**
- Check handler name matches in main and preload
- Verify handler is registered before window loads
- Check main process console for errors

**Issue:** TypeScript errors  
**Solution:**
- Run `pnpm run type-check` to see all errors
- Verify tsconfig.json includes correct paths
- Check type imports are correct

---

## 📦 Building & Packaging

### Development Build

```bash
# Build all packages (TypeScript → JavaScript)
pnpm run build

# Output: packages/*/dist/
```

### Production Build

```bash
# Build and package for current platform
pnpm --filter @sbf/desktop build

# Output: packages/desktop/dist/
#   - mac: .dmg
#   - windows: .exe installer
#   - linux: .AppImage
```

### Platform-Specific Builds

```bash
# Build for specific platform (requires platform dependencies)
pnpm --filter @sbf/desktop build --mac
pnpm --filter @sbf/desktop build --win
pnpm --filter @sbf/desktop build --linux
```

**Note:** Cross-platform building may require platform-specific tools.

---

## 🤝 Contributing

### Workflow

1. **Create Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Follow code style guide
   - Write tests for new functionality
   - Update documentation

3. **Test Changes**
   ```bash
   pnpm run type-check
   pnpm test
   pnpm --filter @sbf/desktop dev  # Manual testing
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: Add my feature"
   ```
   
   Use conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation only
   - `refactor:` Code refactoring
   - `test:` Adding tests
   - `chore:` Maintenance tasks

5. **Push & PR**
   ```bash
   git push origin feature/my-feature
   ```
   Create pull request on GitHub

### Code Review Checklist

- [ ] Code follows style guide
- [ ] TypeScript compiles without errors
- [ ] Tests pass (when available)
- [ ] Documentation updated
- [ ] No console.log left in code
- [ ] Commit messages follow conventions
- [ ] No breaking changes (or documented)

---

## 🔍 Troubleshooting

### Monorepo Issues

**Problem:** Package not found  
```bash
# Reinstall dependencies
rm -rf node_modules packages/*/node_modules
pnpm install
```

**Problem:** Circular dependency detected  
```bash
# Check package.json dependencies
# Ensure no package depends on itself or creates a cycle
```

### Electron Issues

**Problem:** White screen on launch  
- Check renderer console for errors
- Verify index.html path in main process
- Check preload script is loading

**Problem:** IPC not working  
- Verify contextIsolation is true
- Check preload script is specified
- Ensure handlers registered before window loads

### TypeScript Issues

**Problem:** Type errors in imports  
```bash
# Rebuild all packages
pnpm run build

# Check TypeScript configuration
pnpm run type-check
```

---

## 📚 Resources

### Official Documentation
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [pnpm Workspaces](https://pnpm.io/workspaces)

### Internal Documentation
- `README.md` - Project overview
- `ARCHITECTURE.md` - Technical architecture
- `IMPLEMENTATION-STATUS.md` - Current status
- `docs/03-architecture/` - Architecture specs

### Learning Resources
- **Electron:** [Electron Fiddle](https://www.electronjs.org/fiddle) for quick experiments
- **React:** [React Tutorial](https://react.dev/learn)
- **TypeScript:** [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

---

## 🎓 Best Practices

### Security
- ✅ Always validate user input
- ✅ Use contextIsolation in Electron
- ✅ Never trust renderer process data
- ✅ Validate file paths to prevent traversal
- ✅ Use atomic file operations

### Performance
- ✅ Use React.memo for expensive components
- ✅ Debounce user input handlers
- ✅ Lazy load views with React.lazy
- ✅ Cache frequently accessed files
- ✅ Use worker threads for heavy operations

### Code Quality
- ✅ Keep classes small (<200 LOC)
- ✅ Write self-documenting code
- ✅ Add comments only for complex logic
- ✅ Use TypeScript strict mode
- ✅ Follow single responsibility principle

---

## 📞 Getting Help

### Common Questions

**Q: How do I add a new module to @sbf/core?**  
A: Create folder in `packages/core/src/`, add index.ts, export from `packages/core/src/index.ts`

**Q: How do I test IPC handlers?**  
A: Use Playwright for Electron (integration tests) or mock ipcRenderer (unit tests)

**Q: How do I debug the main process?**  
A: Use VS Code debugger (see Debugging section) or `console.log` statements

**Q: Why isn't hot reload working?**  
A: Renderer should hot reload, but main/preload require restart

**Q: How do I update dependencies?**  
A: Run `pnpm update` in sbf-app root

### Need More Help?

- Check `IMPLEMENTATION-STATUS.md` for current state
- Review `ARCHITECTURE.md` for design decisions
- Search issues on GitHub
- Ask in project discussions

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-14  
**Maintained By:** Winston (Architect Agent)  
**Status:** Living Document - Updated as project evolves
