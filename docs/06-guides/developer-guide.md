# Developer Guide

**Welcome, Developer!** This guide will help you set up your development environment and start contributing to Second Brain Foundation.

---

## 📖 Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Running the Development Server](#running-the-development-server)
- [Project Architecture](#project-architecture)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Building and Deployment](#building-and-deployment)
- [Contributing Workflow](#contributing-workflow)

---

## 🛠️ Development Environment Setup

### Prerequisites

**Required:**
- **Node.js** 18+ ([download](https://nodejs.org/))
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **Python** 3.10+ ([download](https://www.python.org/))
- **Git** ([download](https://git-scm.com/))

**Optional:**
- **VS Code** with recommended extensions
- **Ollama** for local AI testing ([download](https://ollama.ai/))

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/SecondBrainFoundation.git
cd SecondBrainFoundation
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies (monorepo)
cd Extraction-01/03-integration/sbf-app
pnpm install

# Install Python dependencies
cd ../../../aei-core
pip install -r requirements.txt
# or
pip install anthropic openai chromadb
```

### 3. Environment Variables

Create a `.env` file in `sbf-app/` directory:

```bash
# .env file
VITE_API_URL=http://localhost:3001
VITE_VAULT_PATH=C:/!Projects/SecondBrainFoundation/vault

# Optional: AI Provider (can also configure via UI)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Project Structure Overview

```
SecondBrainFoundation/
├── aei-core/                    # Python AI backend
│   ├── agent.py                 # Main SBFAgent class
│   ├── memory.py                # Memory management
│   ├── tools/                   # Agent tools
│   └── providers/               # LLM provider clients
│
├── Extraction-01/03-integration/sbf-app/  # Main application
│   ├── packages/
│   │   ├── core/                # TypeScript core logic
│   │   │   ├── src/agent/       # Agent orchestration
│   │   │   ├── src/entities/    # Entity management
│   │   │   ├── src/watcher/     # File watcher
│   │   │   └── src/tools/       # Tool definitions
│   │   │
│   │   ├── ui/                  # React frontend
│   │   │   ├── src/components/  # UI components
│   │   │   ├── src/stores/      # State management
│   │   │   ├── src/api/         # API client
│   │   │   └── src/utils/       # Utilities
│   │   │
│   │   ├── server/              # Express backend (future)
│   │   └── desktop/             # Electron wrapper (future)
│   │
│   └── pnpm-workspace.yaml      # Monorepo config
│
├── libraries/                   # Extracted reference code
├── docs/                        # Documentation
├── templates/                   # Note templates
└── vault/                       # User's vault (gitignored)
```

---

## 🚀 Running the Development Server

### Option 1: All-in-One (Recommended)

```bash
# From sbf-app/ directory
pnpm dev

# This starts:
# - React frontend (Vite) on http://localhost:5173
# - File watcher service
# - Python backend (if configured)
```

### Option 2: Individual Services

**Terminal 1: Frontend**
```bash
cd Extraction-01/03-integration/sbf-app/packages/ui
pnpm dev
# Opens http://localhost:5173
```

**Terminal 2: File Watcher**
```bash
cd Extraction-01/03-integration/sbf-app/packages/core
pnpm watch
```

**Terminal 3: Python Backend** (optional)
```bash
cd aei-core
python agent.py
# Or use your preferred Python runner
```

### Hot Reload

- **Frontend:** Vite provides instant hot reload for React components
- **Backend:** Use `nodemon` or restart manually when changing Node code
- **Python:** Restart the Python process after changes

---

## 🏗️ Project Architecture

### Core Concepts

**1. Agent System** (`packages/core/src/agent/`)
- **SBFAgent:** Main AI agent orchestrator
- **AgentExecutor:** Executes agent steps and tool calls
- **ConversationManager:** Manages chat history and context

**2. Entity Management** (`packages/core/src/entities/`)
- **EntityFileManager:** CRUD operations for entity files
- **EntityIndex:** In-memory index for fast search
- **RelationshipManager:** Manages entity relationships
- **Schema:** Entity type definitions (Topic, Project, Person, etc.)

**3. File Watcher** (`packages/core/src/watcher/`)
- **FileWatcherService:** Monitors vault for changes
- **QueueManager:** Manages organization queue
- **ChangeDetector:** Detects entity creation, updates, deletions

**4. Tools** (`packages/core/src/tools/` and `aei-core/tools/`)
- **create_entity:** Creates new entity files
- **update_entity:** Updates existing entities
- **search_entities:** Searches entity index
- **create_relationship:** Links entities together

**5. Frontend** (`packages/ui/src/`)
- **Components:** React components (chat, entities, queue)
- **API Client:** Communicates with backend
- **State Management:** Local state and context
- **Utils:** Helper functions and utilities

### Data Flow

```
User Input (Chat/File Edit)
    ↓
Frontend (React UI)
    ↓
API Client
    ↓
Agent Orchestrator
    ↓
Tool Selection & Execution
    ↓
Entity Files / Memory / LLM
    ↓
Response to Frontend
    ↓
UI Update
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- React Hot Toast (notifications)
- React Markdown (rendering)

**Backend:**
- Node.js + TypeScript
- Python 3.10+ (AI agent)
- Express (future API server)

**Storage:**
- Markdown files (entities)
- JSON (metadata)
- LocalStorage (UI settings)
- ChromaDB (vector embeddings - future)

**AI Providers:**
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5)
- Ollama (local models)

---

## 📐 Code Standards

### TypeScript

**Strict Mode:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Naming Conventions:**
- **Components:** PascalCase (`ChatContainer.tsx`)
- **Functions:** camelCase (`handleSubmit`)
- **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Types/Interfaces:** PascalCase (`MessageProps`)
- **Files:** kebab-case for utilities, PascalCase for components

**Component Structure:**
```typescript
// 1. Imports
import React from 'react';
import { SomeType } from './types';

// 2. Types/Interfaces
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

// 3. Component
export const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  // 4. Hooks
  const [state, setState] = useState('');
  
  // 5. Handlers
  const handleClick = () => {
    onAction();
  };
  
  // 6. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 7. Render
  return (
    <div>{title}</div>
  );
};
```

### Python

**PEP 8 Compliance:**
- 4 spaces for indentation
- Max line length: 88 (Black formatter)
- Type hints for function signatures

**Example:**
```python
from typing import List, Optional

def create_entity(
    name: str,
    entity_type: str,
    content: Optional[str] = None
) -> dict:
    """
    Create a new entity file.
    
    Args:
        name: Entity name
        entity_type: Type (topic, project, person, etc.)
        content: Optional markdown content
        
    Returns:
        Entity metadata dict
    """
    # Implementation
    pass
```

### Code Comments

**When to Comment:**
- ✅ Complex algorithms or business logic
- ✅ Non-obvious workarounds or hacks
- ✅ Public API functions (JSDoc/docstrings)
- ❌ Obvious code (self-explanatory)
- ❌ Commented-out code (delete it)

**JSDoc Example:**
```typescript
/**
 * Searches entities by text query.
 * 
 * @param query - Search query string
 * @param filters - Optional type and metadata filters
 * @returns Array of matching entities
 */
export function searchEntities(
  query: string,
  filters?: EntityFilters
): Entity[] {
  // Implementation
}
```

### Formatting

**ESLint + Prettier:**
```bash
# Lint code
pnpm lint

# Fix auto-fixable issues
pnpm lint:fix

# Format code
pnpm format
```

**Pre-commit Hooks:**
We use Husky to run linters before commit:
```bash
# Install hooks
pnpm prepare

# Hooks will run automatically on git commit
```

---

## 🧪 Testing

### Unit Testing

**Framework:** Jest + React Testing Library

**Run Tests:**
```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

**Example Test:**
```typescript
// EntityCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EntityCard } from './EntityCard';

describe('EntityCard', () => {
  it('renders entity title', () => {
    const entity = {
      name: 'Test Topic',
      type: 'topic',
      metadata: {},
    };
    
    render(<EntityCard entity={entity} />);
    expect(screen.getByText('Test Topic')).toBeInTheDocument();
  });
  
  it('shows type badge', () => {
    const entity = { name: 'Test', type: 'project', metadata: {} };
    render(<EntityCard entity={entity} />);
    expect(screen.getByText('project')).toBeInTheDocument();
  });
});
```

### Component Testing

**Test user interactions:**
```typescript
import userEvent from '@testing-library/user-event';

it('calls onApprove when approve button clicked', async () => {
  const onApprove = jest.fn();
  render(<QueueItem item={mockItem} onApprove={onApprove} />);
  
  await userEvent.click(screen.getByText('Approve'));
  expect(onApprove).toHaveBeenCalledWith(mockItem.id);
});
```

### Integration Testing

**Test full workflows:**
```typescript
it('creates entity and adds to list', async () => {
  render(<EntityBrowser />);
  
  // Open create modal
  await userEvent.click(screen.getByText('New Entity'));
  
  // Fill form
  await userEvent.type(screen.getByLabelText('Name'), 'Test Topic');
  await userEvent.selectOptions(screen.getByLabelText('Type'), 'topic');
  
  // Submit
  await userEvent.click(screen.getByText('Create'));
  
  // Verify in list
  expect(await screen.findByText('Test Topic')).toBeInTheDocument();
});
```

### Writing Good Tests

**Best Practices:**
1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Arrange-Act-Assert pattern**
4. **Mock external dependencies**
5. **Test edge cases and errors**
6. **Keep tests fast and isolated**

---

## 📦 Building and Deployment

### Development Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @sbf/ui build
pnpm --filter @sbf/core build
```

### Production Build

```bash
# Production build with optimizations
pnpm build:prod

# Output in packages/ui/dist/
```

### Desktop App (Future)

```bash
# Build Electron app
pnpm --filter @sbf/desktop build

# Package for distribution
pnpm --filter @sbf/desktop package
```

### Environment-Specific Builds

**.env.production:**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_ANALYTICS=true
```

**Build with env:**
```bash
NODE_ENV=production pnpm build
```

---

## 🤝 Contributing Workflow

See **[CONTRIBUTING.md](../../CONTRIBUTING.md)** for detailed contribution guidelines.

**Quick Steps:**

1. **Fork and Clone**
2. **Create Feature Branch:** `git checkout -b feature/your-feature`
3. **Make Changes:** Follow code standards
4. **Test:** Run tests and linters
5. **Commit:** Use conventional commits
6. **Push:** `git push origin feature/your-feature`
7. **Open PR:** Describe your changes

**Commit Message Format:**
```
type(scope): description

feat(entities): add relationship type filtering
fix(chat): resolve markdown rendering issue
docs(api): update entity creation examples
```

---

## 🐛 Debugging

### Browser DevTools

**React Developer Tools:**
- Install extension
- Inspect component props and state
- Profile performance

**Console Logging:**
```typescript
// Enable debug mode in settings
if (settings.debugMode) {
  console.log('[Agent] Processing message:', message);
}
```

### VS Code Debugging

**launch.json:**
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/packages/server/src/index.ts",
  "preLaunchTask": "build",
  "outFiles": ["${workspaceFolder}/dist/**/*.js"]
}
```

### Python Debugging

```python
# Add breakpoints with debugpy
import debugpy
debugpy.listen(5678)
debugpy.wait_for_client()

# Or use pdb
import pdb; pdb.set_trace()
```

---

## 📚 Additional Resources

- **Architecture Docs:** [docs/03-architecture/](../03-architecture/)
- **API Reference:** [api-documentation.md](./api-documentation.md)
- **User Guide:** [getting-started.md](./getting-started.md)
- **Troubleshooting:** [troubleshooting.md](./troubleshooting.md)

---

## 🆘 Getting Help

**Questions?**
- 💬 GitHub Discussions
- 🐛 GitHub Issues (for bugs)
- 📧 Email: support@sbf.dev (coming soon)

---

**Happy Coding! 🚀**

Last Updated: 2025-11-15
