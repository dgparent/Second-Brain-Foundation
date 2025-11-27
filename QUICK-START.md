# Quick Start Guide

**Get Second Brain Foundation running in 5 minutes**

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** and **npm 10+** installed
- ✅ **Git** for version control
- ✅ **Docker** (optional, for analytics features)
- ✅ **PostgreSQL** (or use Neon cloud database)

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SecondBrainFoundation.git
cd SecondBrainFoundation
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or using pnpm (faster)
pnpm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# Required: DATABASE_URL, JWT_SECRET
```

**Minimum .env configuration:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/sbf
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### 4. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 5. Build the Project

```bash
# Build all packages
npm run build
```

This should take ~15 seconds on a modern machine.

---

## Running the Application

### Desktop App (Recommended)

```bash
# Start the desktop application
npm run desktop:dev
```

This will:
- Launch the Electron desktop app
- Start the local development server
- Open the app window

### Web Application

```bash
# Start the web app
npm run web:dev

# In another terminal, start the API
npm run api:dev
```

Access at: `http://localhost:3000`

### API Server Only

```bash
# Start the NestJS API server
npm run api:dev
```

API will be available at: `http://localhost:4000`  
API Docs (Swagger): `http://localhost:4000/api`

---

## First Steps

### 1. Create Your Account

- Open the desktop app or web interface
- Click "Sign Up"
- Enter your details
- Create your first tenant/workspace

### 2. Connect Your Vault (Desktop Only)

```bash
# Initialize your vault
npm run vault:init

# Or point to existing Obsidian vault
# Settings → Vault → Browse to your vault folder
```

### 3. Try Creating Entities

**Via Desktop App:**
1. Create a markdown file in your vault: `People/John Doe.md`
2. Add frontmatter:
   ```yaml
   ---
   type: person
   email: john@example.com
   ---
   ```
3. Save - the entity will auto-sync!

**Via API:**
```bash
# Create a person entity
curl -X POST http://localhost:4000/api/people \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

### 4. Explore the Module System

```bash
# List available modules
npm run marketplace:list

# Install a module
npm run marketplace:install @sbf/budgeting
```

---

## Development Workflow

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific package tests
npm run test -- packages/@sbf/shared
```

### Code Quality

```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

### Building for Production

```bash
# Build all packages
npm run build

# Build desktop app
npm run desktop:build

# Output: dist/ folder
```

---

## Common Commands

### Workspace Management

```bash
npm run clean              # Clean all build artifacts
npm run reset              # Reset node_modules and reinstall
npm run dev                # Start all development servers
npm run build              # Build all packages
```

### Database

```bash
npm run db:migrate         # Run migrations
npm run db:rollback        # Rollback last migration
npm run db:seed            # Seed database
npm run db:reset           # Reset database
npm run db:studio          # Open database GUI
```

### Development

```bash
npm run api:dev            # Start API server
npm run web:dev            # Start web app
npm run desktop:dev        # Start desktop app
npm run aei:dev            # Start Python AEI core
```

---

## Troubleshooting

### Build Errors

**Problem:** `Module not found` errors

**Solution:**
```bash
npm run clean
npm install
npm run build
```

### Database Connection Issues

**Problem:** Can't connect to PostgreSQL

**Solution:**
1. Verify DATABASE_URL in .env
2. Ensure PostgreSQL is running
3. Check firewall settings
4. Try: `npm run db:test-connection`

### Desktop App Won't Start

**Problem:** Electron app crashes on startup

**Solution:**
1. Check Node.js version (must be 20+)
2. Rebuild native modules: `npm run rebuild`
3. Clear cache: `rm -rf ~/.electron`
4. Check logs: `~/.sbf/logs/`

### Port Already in Use

**Problem:** Port 3000/4000 already in use

**Solution:**
```bash
# Find and kill process
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill
```

---

## Next Steps

### For Users

- 📖 **[User Guide](./docs/06-guides/user-guide.md)** - Learn how to use 2BF
- 🎓 **[Tutorials](./docs/06-guides/tutorials/)** - Step-by-step guides
- ❓ **[FAQ](./docs/06-guides/faq.md)** - Common questions

### For Developers

- 🏗️ **[Architecture Guide](./docs/03-architecture/architecture.md)** - System overview
- 💻 **[Developer Guide](./docs/06-guides/developer-guide.md)** - Development practices
- 🔌 **[Module Development](./docs/04-implementation/MODULE-DEVELOPMENT-GUIDE.md)** - Build modules
- 🤝 **[Contributing](./CONTRIBUTING.md)** - How to contribute

### For Deploying

- 🚀 **[Deployment Guide](./docs/deployment/README.md)** - Deploy to production
- 🐳 **[Docker Guide](./docs/deployment/docker.md)** - Container deployment
- ☁️ **[Cloud Setup](./docs/deployment/cloud.md)** - Cloud deployment

---

## Getting Help

- 📚 **Documentation:** Check `/docs` folder
- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/SecondBrainFoundation/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/SecondBrainFoundation/discussions)
- 📧 **Email:** support@secondbrainfoundation.com

---

## Quick Reference Card

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run build` | Build all packages |
| `npm run dev` | Start development mode |
| `npm test` | Run tests |
| `npm run lint` | Check code quality |
| `npm run desktop:dev` | Run desktop app |
| `npm run api:dev` | Run API server |
| `npm run db:migrate` | Run database migrations |

---

**Estimated Setup Time:** 5-10 minutes  
**Difficulty:** Easy  
**Support:** Community-supported

---

*For detailed setup instructions, see [Getting Started Guide](./docs/06-guides/getting-started.md)*
