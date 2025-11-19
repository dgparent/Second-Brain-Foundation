# Contributing to Second Brain Foundation

First off, **thank you** for considering contributing to Second Brain Foundation! 🎉

It's people like you that make this project a powerful tool for personal knowledge management. This document provides guidelines to make the contribution process smooth and effective for everyone involved.

---

## 📖 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

---

## 🤝 Code of Conduct

This project adheres to a **Code of Conduct** that all contributors are expected to follow. By participating, you are expected to uphold this code.

**In short:**
- **Be respectful** and considerate
- **Be collaborative** and helpful
- **Welcome newcomers** and be patient
- **Focus on what is best** for the community
- **Show empathy** towards other community members

---

## 🎯 How Can I Contribute?

There are many ways to contribute to Second Brain Foundation:

### 1. 🐛 Report Bugs
Found a bug? Help us fix it by [creating an issue](https://github.com/YourUsername/SecondBrainFoundation/issues/new).

### 2. 💡 Suggest Features
Have an idea for improvement? [Open a feature request](https://github.com/YourUsername/SecondBrainFoundation/issues/new).

### 3. 📝 Improve Documentation
- Fix typos or unclear explanations
- Add examples or use cases
- Write tutorials or guides
- Translate documentation

### 4. 💻 Submit Code
- Fix bugs
- Implement new features
- Improve performance
- Refactor code

### 5. 🧪 Test & Review
- Test new features
- Review pull requests
- Report edge cases
- Validate fixes

### 6. 💬 Help Others
- Answer questions in Discussions
- Help troubleshoot issues
- Share your experience
- Mentor new contributors

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Git**
- **Text editor** (VS Code recommended)
- Basic knowledge of TypeScript/React

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
```bash
git clone https://github.com/YOUR-USERNAME/SecondBrainFoundation.git
cd SecondBrainFoundation
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/OriginalRepo/SecondBrainFoundation.git
```

4. **Install dependencies**
```bash
cd Extraction-01/03-integration/sbf-app
npm install
```

5. **Create a branch**
```bash
git checkout -b feature/your-feature-name
```

6. **Run the development server**
```bash
npm run dev
```

### Project Structure

```
SecondBrainFoundation/
├── Extraction-01/03-integration/sbf-app/
│   ├── packages/
│   │   ├── core/          # Core TypeScript logic
│   │   │   ├── src/
│   │   │   │   ├── agent/     # AI agent system
│   │   │   │   ├── entities/  # Entity management
│   │   │   │   ├── tools/     # Tool system
│   │   │   │   └── watcher/   # File watching
│   │   │   └── package.json
│   │   │
│   │   └── ui/            # React frontend
│   │       ├── src/
│   │       │   ├── components/  # React components
│   │       │   ├── stores/      # State management
│   │       │   ├── api/         # API layer
│   │       │   └── App.tsx
│   │       └── package.json
│   │
│   └── package.json       # Workspace root
│
├── docs/                  # Documentation
├── vault/                 # Example vault
└── README.md
```

---

## 🔄 Development Workflow

### 1. Create an Issue First

Before starting work:
- Search existing issues to avoid duplicates
- Create a new issue describing what you want to do
- Wait for feedback from maintainers
- Get assigned to the issue

### 2. Make Your Changes

- Keep changes focused on one thing
- Write clean, readable code
- Follow existing code style
- Add comments where needed
- Update relevant documentation

### 3. Test Your Changes

```bash
# Run the dev server and manually test
npm run dev

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### 4. Commit Your Changes

Use clear, descriptive commit messages (see [Commit Guidelines](#commit-message-guidelines))

```bash
git add .
git commit -m "feat: add entity relationship visualization"
```

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Fill out the PR template
- Link the related issue

---

## 📤 Pull Request Process

### PR Checklist

Before submitting, ensure:

- [ ] Code follows project style guidelines
- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Changes are well-tested manually
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow guidelines
- [ ] PR description is clear and complete
- [ ] Linked to related issue

### PR Description Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Automated checks** run (linting, type-checking)
2. **Maintainer review** (may request changes)
3. **Discussion** and iterations
4. **Approval** from maintainer
5. **Merge** to main branch

**Be patient!** Reviews may take a few days. Maintainers will provide feedback.

---

## 📏 Code Standards

### TypeScript

- **Use TypeScript strict mode** - Already configured
- **Explicit types** for function parameters and return values
- **No `any` types** unless absolutely necessary
- **Prefer interfaces** over types for object shapes

```typescript
// ✅ Good
interface EntityMetadata {
  uid: string;
  type: EntityType;
  created: Date;
}

function createEntity(metadata: EntityMetadata): Entity {
  // implementation
}

// ❌ Bad
function createEntity(metadata: any) {
  // implementation
}
```

### React

- **Functional components** with hooks
- **Props interfaces** for all components
- **Descriptive component names** (PascalCase)
- **Extract complex logic** into custom hooks

```typescript
// ✅ Good
interface EntityCardProps {
  entity: Entity;
  onSelect: (entity: Entity) => void;
}

export const EntityCard: React.FC<EntityCardProps> = ({ entity, onSelect }) => {
  // implementation
};

// ❌ Bad
export const Card = ({ data, onClick }) => {
  // implementation
};
```

### Naming Conventions

- **Files:** `kebab-case.ts` or `PascalCase.tsx` (components)
- **Variables:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`
- **Classes/Interfaces:** `PascalCase`
- **Functions:** `camelCase`

### Code Organization

- **One component per file**
- **Group related files** in same directory
- **Barrel exports** (`index.ts`) for public APIs
- **Keep files under 300 lines** (split if larger)

### Comments

- **JSDoc comments** for public functions/classes
- **Inline comments** for complex logic
- **No obvious comments** (code should be self-explanatory)

```typescript
// ✅ Good
/**
 * Processes a file change event and creates appropriate entity suggestions
 * @param event - The file system event
 * @returns Array of entity creation suggestions
 */
export async function processFileChange(event: FileEvent): Promise<EntitySuggestion[]> {
  // Complex logic here deserves a comment
  const wikilinks = extractWikilinks(event.content);
  return wikilinks.map(createSuggestion);
}

// ❌ Bad
// This function adds two numbers
function add(a, b) {
  return a + b; // Return the sum
}
```

---

## 📝 Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

### Examples

```bash
# Feature
feat(entities): add relationship visualization

# Bug fix
fix(watcher): resolve duplicate file event handling

# Documentation
docs(guides): update getting-started.md with new screenshots

# Refactor
refactor(agent): extract tool calling logic into separate module

# Breaking change
feat(entities)!: change entity schema format

BREAKING CHANGE: Entity files now require 'version' field in frontmatter
```

### Guidelines

- **Use imperative mood** ("add" not "added" or "adds")
- **First line < 72 characters**
- **Capitalize first letter** of subject
- **No period** at end of subject
- **Separate** subject and body with blank line
- **Explain what and why**, not how (in body)

---

## 🐛 Issue Guidelines

### Bug Reports

Include:
- **Clear title** describing the bug
- **Steps to reproduce** (numbered list)
- **Expected behavior**
- **Actual behavior**
- **System information** (OS, Node version)
- **Error messages** (full stack trace)
- **Screenshots** (if applicable)

**Template:**
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: Windows 11
- Node.js: 18.17.0
- Browser: Chrome 120

## Error Messages
```
Paste error here
```

## Screenshots
[Add if applicable]
```

### Feature Requests

Include:
- **Clear title** describing the feature
- **Problem statement** (what problem does this solve?)
- **Proposed solution** (how would it work?)
- **Alternatives considered** (other ways to solve it)
- **Use cases** (who benefits and how?)

**Template:**
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How would this feature work?

## Alternatives Considered
Other ways to solve this problem

## Use Cases
1. Use case one
2. Use case two

## Additional Context
Any other relevant information
```

---

## 👥 Community

### Communication Channels

- **GitHub Issues:** Bug reports, feature requests
- **GitHub Discussions:** Questions, ideas, general discussion
- **Discord** (coming soon): Real-time chat
- **Twitter:** [@SecondBrainFoundation](https://twitter.com/SecondBrainFoundation) - Announcements

### Getting Help

1. **Check documentation** first
2. **Search existing issues** and discussions
3. **Ask in Discussions** if you have questions
4. **Be patient** and respectful

### Recognizing Contributors

We appreciate all contributions! Contributors are:
- Listed in our README
- Mentioned in release notes
- Recognized in our Discord community
- Eligible for special contributor badge

---

## 📄 License

By contributing to Second Brain Foundation, you agree that your contributions will be licensed under the [MIT License](LICENSE).

This means:
- Your contributions are free and open source
- Others can use, modify, and distribute your contributions
- You retain copyright to your contributions
- No warranty or liability

---

## 🙏 Thank You!

**Every contribution matters**, whether it's:
- A single typo fix
- An extensive new feature
- Answering someone's question
- Sharing the project with others

**You're helping build something meaningful.** Thank you for being part of the Second Brain Foundation community! 🧠✨

---

## ❓ Questions?

- **Documentation:** See [getting-started.md](docs/06-guides/getting-started.md)
- **Development:** See [developer-guide.md](docs/06-guides/developer-guide.md)
- **Discussions:** [GitHub Discussions](https://github.com/YourUsername/SecondBrainFoundation/discussions)
- **Issues:** [GitHub Issues](https://github.com/YourUsername/SecondBrainFoundation/issues)

**Happy contributing!** 🚀

---

*Last updated: November 15, 2025*
