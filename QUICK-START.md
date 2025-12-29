# Quick Start Guide

**Second Brain Foundation v2.0.2**

This guide will get you up and running with SBF in under 15 minutes.

---

## 📋 Prerequisites

Before starting, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 20+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Python | 3.11+ | `python --version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Git | 2.0+ | `git --version` |

### Install pnpm (if needed)

```bash
# Using npm
npm install -g pnpm

# Or using Corepack (Node.js 16.13+)
corepack enable
corepack prepare pnpm@latest --activate
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/dgparent/Second-Brain-Foundation.git
cd Second-Brain-Foundation
```

### Step 2: Install Node.js Dependencies

```bash
pnpm install
```

This installs all workspace dependencies across all packages.

### Step 3: Set Up Python Environment

```bash
# Navigate to AI engine
cd apps/aei-core

# Create virtual environment
python -m venv venv

# Activate it
# On Linux/macOS:
source venv/bin/activate
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Windows CMD:
venv\Scripts\activate.bat

# Install Python dependencies
pip install -r requirements.txt

# Return to root
cd ../..
```

### Step 4: Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (Docker handles this, but you can customize)
POSTGRES_DB=sbf_db
POSTGRES_USER=sbf_user
POSTGRES_PASSWORD=your-secure-password

# Redis
REDIS_PASSWORD=your-redis-password

# API Keys (Required for AI features)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Optional: ElevenLabs for premium TTS
ELEVENLABS_API_KEY=your-elevenlabs-key

# Application
SECRET_KEY=your-secret-key-for-sessions
SBF_API_KEY=your-api-key-for-clients
ENVIRONMENT=development
```

> **Note:** At minimum, you need `OPENAI_API_KEY` for AI features to work. Other providers are optional fallbacks.

### Step 5: Start Infrastructure Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Verify services are running
docker-compose ps
```

Expected output:
```
NAME            STATUS    PORTS
sbf-postgres    healthy   0.0.0.0:5432->5432/tcp
sbf-redis       healthy   0.0.0.0:6379->6379/tcp
```

### Step 6: Run Database Migrations

```bash
# Run migrations to set up database schema
pnpm run db:migrate
```

### Step 7: Build Packages

```bash
# Build all TypeScript packages
pnpm build
```

---

## 🏃 Running the Application

### Option A: Run All Services Together

```bash
# Start everything in development mode
pnpm run dev
```

This starts:
- Web App on http://localhost:3000
- API on http://localhost:3001
- Background workers

### Option B: Run Services Individually

**Terminal 1 - API Server:**
```bash
cd apps/api
pnpm run dev
```

**Terminal 2 - Web App:**
```bash
cd apps/web
pnpm run dev
```

**Terminal 3 - AI Engine (Python):**
```bash
cd apps/aei-core
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1 on Windows
uvicorn main:app --reload --port 8000
```

**Terminal 4 - Workers (Optional):**
```bash
cd apps/workers
pnpm run dev
```

### Option C: Run with Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## ✅ Verify Installation

### 1. Check Web App

Open http://localhost:3000 in your browser. You should see the SBF dashboard.

### 2. Check API Health

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status": "healthy", "version": "2.0.2"}
```

### 3. Check AI Engine

```bash
curl http://localhost:8000/healthz
```

Expected response:
```json
{"status": "ok"}
```

### 4. Check API Documentation

- REST API Docs: http://localhost:3001/api-docs
- AI Engine Docs: http://localhost:8000/docs

---

## 🎯 First Steps

### Create Your First Notebook

1. Open http://localhost:3000
2. Click "Create Notebook"
3. Enter a name like "My Research"
4. Click "Create"

### Add Your First Source

**Via Web UI:**
1. Open your notebook
2. Click "Add Source"
3. Choose source type (URL, PDF, YouTube)
4. Enter the URL or upload file
5. Click "Ingest"

**Via API:**
```bash
curl -X POST http://localhost:3001/api/sources \
  -H "Content-Type: application/json" \
  -d '{
    "notebookId": "your-notebook-id",
    "type": "web",
    "url": "https://example.com/article"
  }'
```

**Via CLI:**
```bash
# Install CLI globally
npm install -g @sbf/cli

# Initialize
sbf init

# Add source
sbf entity add --notebook my-research --url https://example.com/article
```

### Chat with Your Content

1. Navigate to your notebook
2. Click "Chat"
3. Ask a question about your ingested content
4. View AI response with source citations

---

## 🔧 Common Commands

### Development

```bash
# Start development servers
pnpm run dev

# Build all packages
pnpm build

# Run all tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

### Database

```bash
# Run migrations
pnpm run db:migrate

# Create new migration
pnpm run db:migrate:create my_migration_name

# Reset database (development only!)
pnpm run db:reset
```

### Docker

```bash
# Start infrastructure
docker-compose up -d postgres redis

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop everything
docker-compose down

# Stop and remove volumes (full reset)
docker-compose down -v
```

### CLI

```bash
# Initialize configuration
sbf init

# Search content
sbf search "query"

# Start chat
sbf chat --notebook my-notebook

# Import from Obsidian
sbf migrate import --source obsidian --path /path/to/vault

# Export to NotebookLM format
sbf migrate export --format notebooklm --output ./export
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
# Linux/macOS:
lsof -i :3000
# Windows:
netstat -ano | findstr :3000

# Kill the process or use different port
PORT=3002 pnpm run dev
```

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Restart PostgreSQL
docker-compose restart postgres

# Check logs
docker-compose logs postgres
```

### Python Import Errors

```bash
# Ensure virtual environment is activated
cd apps/aei-core
source venv/bin/activate  # or .\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

### Node Module Not Found

```bash
# Clean install
rm -rf node_modules
pnpm install

# Or for specific package
pnpm --filter @sbf/package-name install
```

### API Key Issues

- Ensure `.env` file exists in project root
- Check API key format (OpenAI keys start with `sk-`)
- Verify API key has sufficient quota

---

## 📁 Project Structure Reference

```
second-brain-foundation/
├── apps/
│   ├── aei-core/          # Python AI backend
│   │   ├── main.py        # FastAPI entry point
│   │   ├── graphs/        # LangGraph agents
│   │   ├── services/      # Business logic
│   │   └── requirements.txt
│   ├── api/               # Node.js REST API
│   │   └── src/
│   │       ├── routes/    # API endpoints
│   │       └── services/  # Business logic
│   └── web/               # Next.js frontend
│       └── src/
│           ├── app/       # App router pages
│           └── components/
├── packages/@sbf/         # Shared packages
│   ├── errors/            # Exception hierarchy
│   ├── ai-client/         # LLM client
│   ├── search-engine/     # Search functionality
│   └── ...
├── infra/                 # Infrastructure
│   ├── migrations/        # SQL migrations
│   └── k8s/               # Kubernetes configs
├── docker-compose.yml     # Local development
├── .env.example           # Environment template
└── package.json           # Root package config
```

---

## 🔗 Next Steps

1. **Read the full documentation**: [README.md](./README.md)
2. **Learn development conventions**: [LESSONS-LEARNED.md](./LESSONS-LEARNED.md)
3. **Contribute**: [CONTRIBUTING.md](./CONTRIBUTING.md)
4. **Explore the API**: http://localhost:8000/docs

---

## 🆘 Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

---

<p align="center">
  <strong>Happy building with Second Brain Foundation! 🧠</strong>
</p>
