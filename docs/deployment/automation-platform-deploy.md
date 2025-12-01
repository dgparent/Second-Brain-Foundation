
0. Purpose

This document explains how to deploy the Second Brain Foundation (2BF) Platform as one integrated stack that includes:

2BF core application (API + frontend)

Activepieces – user-facing no/low-code automations

Trigger.dev – internal job runner & automation engine

Redis – queue backend for Activepieces

(Optional) Reverse proxy – NGINX/Traefik in front of everything

Important design choice:
The platform assumes managed databases (e.g. Supabase, Neon, RDS) for Postgres + pgvector.
The stack runs everything else (2BF core, Activepieces, Trigger.dev, Redis) as containers via Docker Compose.

1. Prerequisites
1.1 Infrastructure

You need:

1 Linux server or VM (Ubuntu 22.04 LTS recommended)

Recommended minimum for staging / early production:

4–8 vCPUs

16 GB RAM

100 GB SSD

Stable internet connection (to pull Docker images, expose webhooks, etc.)

For local development, you can run everything on a desktop/laptop that has Docker Desktop and at least 16 GB RAM.

1.2 Software on the server

Install:

Git

sudo apt update
sudo apt install -y git


Docker

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# log out and log back in for group change to take effect


Docker Compose

On newer Docker versions, docker compose is already included. Test:

docker compose version


If that fails, install docker-compose via your package manager or Docker docs.

1.3 External / managed services

You MUST have:

Managed Postgres (with pgvector if you are doing RAG):

Example: Supabase, Neon, RDS, etc.

You need:

DB_HOST

DB_PORT

DB_NAME

DB_USER

DB_PASSWORD

Connection URL (e.g. postgres://user:pass@host:5432/dbname)

Managed Vector DB (optional if you embed vectors in same Postgres):

Option A (recommended): use the same Postgres with pgvector

Option B: separate vector service (Pinecone, Weaviate, etc.)

Domain names (recommended for production)

app.example.com → 2BF UI / API

automation.example.com → Activepieces

jobs.example.com → Trigger.dev

For local development, you can skip domains and use http://localhost:PORT.

1.4 Credentials & secrets

Before deploying, you should have:

Postgres connection string(s)

API keys for LLM providers / OSS gateways

Any OAuth client IDs/secrets for third-party integrations (optional initially)

These will be set in the .env file inside the 2BF platform repo.

2. Repository layout (platform bundle)

We will assume you have a single “platform” repo that defines the deployment:

/Repo/2bf-platform/
  ├─ docker-compose.yml
  ├─ .env.example
  ├─ docs/
  │   └─ 2BF-Platform-Deployment.md  (this file)
  ├─ 2bf-app/                        (submodule or source)
  ├─ activepieces/                   (submodule or cloned repo)
  ├─ trigger.dev/                    (submodule or cloned repo)
  └─ reverse-proxy/                  (optional: nginx/traefik config)


Notes:

docker-compose.yml is the single entry point to launch the whole stack.

2BF, Activepieces, and Trigger.dev may be built as Docker images from these folders or pulled from registries.

The .env in this repo configures all container services via environment variables.

3. Services overview

The docker-compose.yml will roughly define these services:

2bf-api – 2BF backend (Node.js / TS)

2bf-frontend – 2BF frontend (Next.js/React or similar)

activepieces-server – Activepieces API / engine

activepieces-ui – Activepieces web UI

activepieces-redis – Redis instance for Activepieces queues

triggerdev-api – Trigger.dev web/API service

triggerdev-worker – Trigger.dev job worker

reverse-proxy – (optional) NGINX/Traefik that routes by host/domain

All of these are brought up together by:

docker compose up -d

4. Environment configuration (.env)

Inside /Repo/2bf-platform/ there is a .env.example.
You must create a real .env and fill in all required values.

4.1 Create .env from template
cd /Repo/2bf-platform
cp .env.example .env

4.2 Fill in required sections

Open .env in your editor and set:

4.2.1 Common variables
# Common
PLATFORM_ENV=production   # or "staging" / "development"

# External DB (managed Postgres)
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_URL=postgres://your-db-user:your-db-password@your-db-host:5432/your-db-name


If 2BF, Activepieces, and Trigger.dev use different schemas / databases, you may have:

DB_URL_2BF=postgres://...
DB_URL_ACTIVEPIECES=postgres://...
DB_URL_TRIGGER=postgres://...

4.2.2 2BF application
# Public URL of 2BF app (used in emails, redirects, etc.)
APP_BASE_URL=https://app.example.com

# Internal service port (used by docker-compose)
APP_PORT=3000

# JWT / session secrets
APP_JWT_SECRET=change_me
APP_SESSION_SECRET=change_me_too

# LLM & Vector config (example)
LLM_PROVIDER_URL=https://your-oss-llm-gateway.example.com
LLM_API_KEY=your-llm-api-key
VECTOR_DB_URL=$DB_URL   # if sharing Postgres

4.2.3 Activepieces
# Public URL for Activepieces
ACTIVEPIECES_BASE_URL=https://automation.example.com

# Internal ports
ACTIVEPIECES_API_PORT=8080
ACTIVEPIECES_UI_PORT=8081

# DB & Redis
ACTIVEPIECES_DB_URL=$DB_URL_ACTIVEPIECES
REDIS_URL=redis://activepieces-redis:6379

# Security
AP_ENCRYPTION_KEY=change_me
AP_JWT_SECRET=change_me

4.2.4 Trigger.dev
# Public URL for Trigger.dev dashboard (if exposed)
TRIGGERDEV_BASE_URL=https://jobs.example.com

# Internal ports
TRIGGERDEV_API_PORT=8787

# DB
TRIGGERDEV_DB_URL=$DB_URL_TRIGGER

# API keys / secrets
TRIGGER_API_KEY=change_me   # used by 2BF to schedule jobs
TRIGGER_JWT_SECRET=change_me_too

4.2.5 Reverse proxy (optional)
# Domains used by reverse proxy
DOMAIN_APP=app.example.com
DOMAIN_AP=automation.example.com
DOMAIN_TRIGGER=jobs.example.com

# Email for Let's Encrypt
LETSENCRYPT_EMAIL=you@example.com


Be explicit and careful with all secrets. Never commit .env to Git.

5. Deployment steps
5.1 Clone the platform repo

On your target server:

cd /Repo
git clone <YOUR_2BF_PLATFORM_REPO_URL> 2bf-platform
cd 2bf-platform


If the repo uses submodules for 2bf-app, activepieces, and trigger.dev:

git submodule update --init --recursive

5.2 Prepare .env
cp .env.example .env
nano .env
# or use vim, code, etc.


Fill all required variables as described above.

5.3 (Optional) Build application images

If your docker-compose.yml builds images from local Dockerfiles:

docker compose build


If it pulls prebuilt images from a registry (e.g., ghcr.io/your-org/2bf-api:latest), this step may be optional and Compose will pull automatically.

5.4 Launch the platform

Run:

docker compose up -d


This will:

Create networks & volumes

Start:

2BF API + frontend

Activepieces server + UI + Redis

Trigger.dev API + worker

Reverse proxy (if configured)

To watch logs:

docker compose logs -f

5.5 Verify services
5.5.1 Check containers
docker compose ps


You should see all services in State: running.

5.5.2 Access UIs

Depending on your config:

Local dev (no reverse proxy):

2BF: http://localhost:3000

Activepieces: http://localhost:8081

Trigger.dev: http://localhost:8787

Production with reverse proxy + domains:

2BF: https://app.example.com

Activepieces: https://automation.example.com

Trigger.dev: https://jobs.example.com

Confirm you can:

Log into 2BF.

Access Activepieces UI and create a sample flow.

Access Trigger.dev dashboard and see an empty or sample project.

6. Wiring services together (high-level)

Once everything is running:

6.1 2BF → Trigger.dev

In 2BF backend code, set up a Trigger.dev client using TRIGGER_API_KEY and TRIGGERDEV_BASE_URL:

2BF should expose a simple internal wrapper:

// pseudo-code
await jobs.enqueue('vault-ingest', { userId, sourceId, ... });


The wrapper calls Trigger.dev API to enqueue the job.

6.2 2BF → Activepieces

Configure webhooks in Activepieces that 2BF will call on events:

note_created

task_completed

tag_added

Implement custom “2BF pieces” (connectors) inside Activepieces that:

Call 2BF API to read/write data.

Optionally, expose key Activepieces flows as MCP tools for LLM agents.

6.3 AEI (LangGraph.js) → both

Inside your 2BF AEI/agent layer (LangGraph.js graphs):

Create tool nodes that:

Call Trigger.dev API to schedule long-running jobs.

Call Activepieces API (or MCP) to trigger user-facing workflows.

This keeps the automation engines external but fully controlled by 2BF.

7. Monitoring, logs, and backups
7.1 Logs

To inspect logs:

docker compose logs -f 2bf-api
docker compose logs -f activepieces-server
docker compose logs -f triggerdev-api
docker compose logs -f triggerdev-worker


Consider:

Shipping logs to a central system (ELK, Loki, etc.) once in production.

7.2 Backups

Databases (managed Postgres) must have:

Automated daily backups

Point-in-time recovery if available

Redis for Activepieces queues can usually be treated as ephemeral (jobs can be retried from upstream events), but double-check depending on your flows.

Regularly back up:

docker-compose.yml,

configuration scripts,

any local storage volumes if you use them.

8. Upgrading the platform
8.1 Pull latest code / images

On the server:

cd /Repo/2bf-platform
git pull
git submodule update --init --recursive   # if using submodules
docker compose pull                       # if using registry images
docker compose build                      # if you build locally

8.2 Apply migrations

If 2BF, Activepieces, or Trigger.dev require DB migrations, follow each project’s migration instructions (commonly:

docker compose run --rm 2bf-api npm run migrate
docker compose run --rm activepieces-server npm run migrate
docker compose run --rm triggerdev-api npm run migrate


…or equivalent commands documented in each repo).

8.3 Restart services
docker compose up -d


Check logs and UIs to verify everything came up correctly.

9. Summary checklist

Before deployment:

 Managed Postgres (and optionally pgvector) set up

 LLM provider / OSS LLM gateway URL + API keys available

 Domain names + DNS records (if needed) configured

On the server:

 Git installed

 Docker & Docker Compose installed

 2bf-platform repo cloned to /Repo/2bf-platform

 .env created and filled with valid values

 docker compose up -d executed

After deployment:

 All containers are running (docker compose ps)

 2BF UI accessible

 Activepieces UI accessible

 Trigger.dev UI accessible

 2BF can trigger a test job in Trigger.dev

 2BF can trigger a test automation in Activepieces