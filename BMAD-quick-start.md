# BMAD Quick Start - Common Commands

## Installation & Setup

```powershell
# Install BMAD-METHOD
npx bmad-method install

# Initialize your project
bmad-method init
```

## Core Commands

```powershell
# Check BMAD version
bmad-method --version

# View help
bmad-method --help

# Run in your IDE (Cursor, Windsurf, VS Code)
*workflow-init
```

## Development Commands

```powershell
# Install workspace dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build project
pnpm build

# Lint code
pnpm lint
```

## What You Can Do

| What | How |
|------|-----|
| **Analyze** | Use PM & Architect agents to plan |
| **Design** | Use UX & Designer agents for mockups |
| **Build** | Use Developer agent for coding |
| **Test** | Use QA & Test agents for quality |
| **Document** | Use Writer agent for docs |
| **Deploy** | Use DevOps agent for infrastructure |
| **Automate** | Use Automation agent for workflows |

## Available Agents

**19 Specialized Agents**: PM, Architect, Developer, UX Designer, QA Engineer, Test Specialist, Technical Writer, Scrum Master, DevOps, Data Engineer, and more.

## Available Workflows

**50+ Guided Workflows** across:
- Analysis & Planning
- Solutioning & Design
- Implementation & Testing
- Deployment & Operations

## IDE Integration

1. Open your IDE (VS Code, Cursor, Windsurf)
2. Invoke command palette
3. Run `*workflow-init` 
4. Select your workflow
5. Follow guided steps

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `node not found` | Install from https://nodejs.org/ |
| `npx not found` | Restart PowerShell after Node.js install |
| `permission denied` | Run: `powershell -ExecutionPolicy Bypass` |
| `BMAD install fails` | Run: `npm cache clean --force` then retry |

## Resources

- **Discord**: https://discord.gg/gk8jAdXWmj
- **Docs**: https://github.com/bmad-code-org/BMAD-METHOD
- **NPM**: https://www.npmjs.com/package/bmad-method

---

**Next**: Run `bmad-method init` to get started!
