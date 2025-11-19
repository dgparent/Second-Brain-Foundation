# Tech Stack Decisions

**Date:** 2025-11-14  
**Architect:** Winston  
**Approved By:** User (Project Lead)  
**Status:** ✅ Finalized

---

## Decisions Summary

```yaml
# Core Decisions
scope: P0+P1                          # Complete MVP (8 components)
desktop: Electron                     # Desktop framework
editor: mdx-editor                    # Markdown editor (@mdxeditor/editor npm package)
backend: Hybrid                       # Extract anything-llm + Custom TypeScript
approach: Phased                      # Module-by-module validation

# Supporting Decisions
state_management: Zustand             # State management
package_manager: pnpm                 # Package manager
monorepo: Yes                         # pnpm workspaces
```

---

## Complete Technology Stack

### Frontend

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Desktop Framework** | Electron | 28+ | Mature, proven, extensive library references (FreedomGPT, jan, anything-llm) |
| **UI Framework** | React | 18+ | Industry standard, type safety, library compatibility |
| **Language** | TypeScript | 5.3+ | Type safety, better DX, unified with backend |
| **Editor** | @mdxeditor/editor | latest | Production-ready Lexical wrapper, saves 2-3 weeks |
| **State Management** | Zustand | 4+ | Lightweight, minimal boilerplate, growing adoption |
| **Styling** | Tailwind CSS | 3+ | Rapid development, utility-first, consistent design |
| **Build Tool** | Vite | 5+ | Fast HMR, modern ESM, excellent Electron integration |
| **Testing** | Vitest + RTL | latest | Fast, Vite-native, familiar React Testing Library API |
| **Package Manager** | pnpm | 8+ | Fast, disk-efficient, excellent monorepo support |

### Backend

| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| **Runtime** | Node.js | 20+ | Same as Electron, TypeScript compatible, mature ecosystem |
| **Language** | TypeScript | 5.3+ | Type safety, unified with frontend, excellent DX |
| **File System** | Node.js fs + chokidar | latest | Native file operations + robust change watching |
| **Frontmatter Parser** | gray-matter | latest | Industry standard for YAML frontmatter in markdown |
| **Markdown Parser** | remark + remark-parse | latest | Extensible, plugin-based markdown processing |
| **Schema Validation** | zod | latest | TypeScript-first schema validation and inference |
| **Search Engine** | fuse.js | latest | Lightweight fuzzy search, no database required |
| **Scheduling** | node-cron | latest | Cron-like scheduling for lifecycle transitions |
| **Hashing** | crypto (Node.js native) | - | SHA-256 checksums for file integrity |
| **Logging** | winston or pino | latest | Structured logging for debugging and audit trails |

### Development Tools

| Tool | Technology | Version | Purpose |
|------|-----------|---------|---------|
| **Linting** | ESLint | latest | Code quality and consistency |
| **Formatting** | Prettier | latest | Automatic code formatting |
| **Type Checking** | TypeScript Compiler | 5.3+ | Static type checking |
| **Git Hooks** | husky + lint-staged | latest | Pre-commit quality checks |
| **Monorepo** | pnpm workspaces | 8+ | Manage multiple packages in single repo |
| **Documentation** | TypeDoc | latest | API documentation generation |

---

## Project Structure

### Monorepo Layout

```
Extraction-01/03-integration/sbf-app/
├── packages/
│   ├── core/                        # @sbf/core
│   │   ├── src/
│   │   │   ├── filesystem/         # Vault file operations
│   │   │   ├── entities/           # Entity management
│   │   │   ├── metadata/           # Frontmatter handling
│   │   │   ├── lifecycle/          # 48-hour transitions
│   │   │   ├── privacy/            # Sensitivity enforcement
│   │   │   ├── relationships/      # Typed edges
│   │   │   ├── search/             # Indexing & querying
│   │   │   └── types/              # TypeScript types
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── ui/                          # @sbf/ui
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── chat/           # AEI Chat Interface
│   │   │   │   ├── queue/          # Organization Queue
│   │   │   │   ├── editor/         # Markdown Editor
│   │   │   │   ├── entities/       # Entity Management
│   │   │   │   ├── browser/        # File Browser
│   │   │   │   ├── settings/       # Settings Panel
│   │   │   │   ├── search/         # Search & Command Palette
│   │   │   │   └── common/         # Shared components
│   │   │   ├── hooks/              # Custom React hooks
│   │   │   ├── contexts/           # React Context providers
│   │   │   ├── stores/             # Zustand stores
│   │   │   ├── utils/              # Utility functions
│   │   │   └── types/              # UI-specific types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   │
│   └── desktop/                     # @sbf/desktop
│       ├── src/
│       │   ├── main/
│       │   │   ├── index.ts        # Electron main process
│       │   │   ├── menu.ts         # Application menus
│       │   │   ├── window.ts       # Window management
│       │   │   └── ipc.ts          # IPC handlers
│       │   ├── preload/
│       │   │   └── index.ts        # Preload script (context bridge)
│       │   └── renderer/
│       │       └── index.html      # Application entry point
│       ├── package.json
│       ├── tsconfig.json
│       └── electron-builder.yml    # Build configuration
│
├── package.json                     # Root package.json
├── pnpm-workspace.yaml              # Workspace configuration
├── tsconfig.json                    # Root TypeScript config
├── .eslintrc.js                     # ESLint configuration
├── .prettierrc                      # Prettier configuration
└── README.md                        # Project documentation
```

---

## Dependencies

### Core Dependencies (Monorepo Root)

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-react": "^7.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.3.0"
  }
}
```

### @sbf/core Dependencies

```json
{
  "dependencies": {
    "chokidar": "^3.5.0",
    "fuse.js": "^7.0.0",
    "gray-matter": "^4.0.0",
    "node-cron": "^3.0.0",
    "remark": "^15.0.0",
    "remark-parse": "^11.0.0",
    "unified": "^11.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/node-cron": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
```

### @sbf/ui Dependencies

```json
{
  "dependencies": {
    "@mdxeditor/editor": "^3.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zustand": "^4.4.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### @sbf/desktop Dependencies

```json
{
  "dependencies": {
    "electron": "^28.0.0"
  },
  "devDependencies": {
    "electron-builder": "^24.0.0",
    "vite-plugin-electron": "^0.28.0",
    "vite-plugin-electron-renderer": "^0.14.0"
  }
}
```

---

## Development Configuration

### TypeScript Configuration (Root)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "composite": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

### ESLint Configuration

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'react/react-in-jsx-scope': 'off' // Not needed in React 18
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## Justification for Each Choice

### Why Electron over Tauri?
- **Proven:** Mature ecosystem, 10+ years of production use
- **Library Support:** 3/26 libraries use Electron (FreedomGPT, jan, anything-llm)
- **Learning Curve:** Lower for team familiar with Node.js
- **Trade-off:** Larger bundle size acceptable for desktop app

### Why mdx-editor over Tiptap?
- **Time Savings:** 2-3 weeks saved by using production-ready package
- **Lexical:** Modern, backed by Meta, good performance
- **Plugin System:** Extensible for SBF needs (frontmatter, entity linking)
- **Trade-off:** Less flexibility, but sufficient for MVP

### Why Zustand over Redux?
- **Simplicity:** Less boilerplate, easier to learn
- **Performance:** Comparable to Redux Toolkit
- **Bundle Size:** Smaller (3.5kb vs 15kb)
- **Growing Adoption:** Modern React community trend

### Why pnpm over npm/yarn?
- **Speed:** 2x faster than npm
- **Disk Space:** Saves 50-70% via content-addressable storage
- **Monorepo:** Excellent workspace support
- **Compatibility:** Drop-in replacement for npm

### Why Hybrid Backend?
- **Best of Both Worlds:** Extract proven patterns + custom SBF logic
- **Time Efficient:** Saves 1 week vs. pure custom build
- **TypeScript:** Unified language across frontend/backend
- **Control:** Full control over SBF-specific features

---

## Migration Strategy (If Needed)

### Electron → Tauri (Future)
If bundle size becomes critical:
- Main process → Rust (rewrite IPC handlers)
- Preload script → Tauri commands
- Renderer stays identical (React)
- **Effort:** 2-3 weeks

### mdx-editor → Tiptap (Future)
If more customization needed:
- Replace `<MDXEditor>` with `<TiptapEditor>`
- Port plugins to Tiptap extensions
- Maintain frontmatter editing UI
- **Effort:** 1-2 weeks

### Zustand → Redux (Future)
If team prefers Redux:
- Convert stores to slices
- Add Redux Toolkit
- Minimal component changes
- **Effort:** 3-5 days

---

## Next Steps

1. ✅ Tech stack finalized
2. ⏳ Create package.json scaffolds
3. ⏳ Set up linting and formatting
4. ⏳ Initialize pnpm workspaces
5. ⏳ Begin Phase 0 extraction

---

**Prepared By:** Winston (Architect)  
**Approved:** 2025-11-14  
**Status:** ✅ FINALIZED - Ready for Implementation
