# SBF VA Tool Suite - Deployment Guide

## 🚀 Deployment Overview

This guide covers deploying the complete SBF VA automation suite:
- SBF API Backend (FastAPI)
- Activepieces Integration
- n8n Integration
- Database (PostgreSQL + pgvector)

---

## 📦 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│  Activepieces UI  │  n8n UI  │  Direct API Clients     │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Integration Layer                      │
│  Activepieces Piece  │  n8n Node  │  Custom Apps        │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    SBF API Backend                      │
│  FastAPI  │  Entity Management  │  Webhook System      │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Database Layer                        │
│  PostgreSQL  │  pgvector  │  Redis (Cache)             │
└─────────────────────────────────────────────────────────┘
```

---

## 🐳 Docker Deployment (Recommended)

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space

### Quick Start

```bash
# 1. Clone repository
git clone <your-repo-url>
cd SecondBrainFoundation

# 2. Copy environment template
cp .env.example .env

# 3. Edit environment variables
nano .env

# 4. Start all services
docker-compose up -d

# 5. Verify services
docker-compose ps
```

### Services

**SBF API** - http://localhost:8000
- FastAPI backend
- API documentation: /docs
- Health check: /healthz

**PostgreSQL** - localhost:5432
- Database: sbf_db
- User: sbf_user
- Password: (from .env)

**n8n** - http://localhost:5678
- Workflow automation
- SBF node pre-installed

**Activepieces** - http://localhost:8080
- Low-code automation
- SBF piece pre-installed

---

## 🔧 Manual Deployment

### 1. Deploy SBF API Backend

#### Option A: Python Virtual Environment

```bash
# Navigate to project
cd aei-core

# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\Activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SBF_API_KEY="your-secure-key-here"
export DATABASE_URL="postgresql://user:pass@localhost/sbf_db"

# Run migrations (future)
# alembic upgrade head

# Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Option B: Systemd Service (Linux)

```bash
# Create service file
sudo nano /etc/systemd/system/sbf-api.service
```

```ini
[Unit]
Description=SBF VA API Backend
After=network.target postgresql.service

[Service]
Type=notify
User=sbf
Group=sbf
WorkingDirectory=/opt/sbf/aei-core
Environment="PATH=/opt/sbf/aei-core/venv/bin"
Environment="SBF_API_KEY=your-key-here"
Environment="DATABASE_URL=postgresql://user:pass@localhost/sbf_db"
ExecStart=/opt/sbf/aei-core/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start
sudo systemctl enable sbf-api
sudo systemctl start sbf-api
sudo systemctl status sbf-api
```

---

### 2. Deploy PostgreSQL Database

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres psql
CREATE DATABASE sbf_db;
CREATE USER sbf_user WITH ENCRYPTED PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE sbf_db TO sbf_user;

# Install pgvector extension
CREATE EXTENSION vector;
```

---

### 3. Deploy Activepieces

```bash
# Using Docker
docker run -d \
  --name activepieces \
  -p 8080:80 \
  -v activepieces_data:/opt/activepieces \
  -e AP_ENCRYPTION_KEY=your-encryption-key \
  activepieces/activepieces:latest

# Install SBF piece
# Copy packages/sbf-automation/pieces/sbf to Activepieces pieces folder
```

---

### 4. Deploy n8n

```bash
# Using Docker
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=your-password \
  n8nio/n8n:latest

# Install SBF node
npm install @sbf/n8n-nodes-sbf
# Or copy packages/sbf-automation/nodes-sbf to n8n custom nodes
```

---

## 🔐 Security Configuration

### API Keys

Generate secure API keys:

```bash
# Generate random API key
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Store in environment:

```bash
# .env file
SBF_API_KEY=your-generated-key-here
DATABASE_PASSWORD=your-db-password-here
SECRET_KEY=your-app-secret-key
```

### HTTPS/SSL

#### Using Nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/sbf-api
server {
    listen 443 ssl http2;
    server_name api.sbf.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/api.sbf.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.sbf.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# Docker logs
docker-compose logs -f api

# Systemd logs
sudo journalctl -u sbf-api -f

# Application logs
tail -f /var/log/sbf/api.log
```

### Metrics (Future)

- Prometheus for metrics collection
- Grafana for visualization
- Alert rules for critical errors

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy SBF API

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Production
        run: |
          ssh user@production-server << 'EOF'
          cd /opt/sbf
          git pull
          docker-compose up -d --build api
          EOF
```

---

## 🧪 Testing Deployment

### Health Checks

```bash
# API health
curl https://api.sbf.yourdomain.com/healthz

# Database connection
curl https://api.sbf.yourdomain.com/readyz

# Create test entity
curl -X POST https://api.sbf.yourdomain.com/api/v1/entities \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type":"va.task","client_uid":"test","title":"Test"}'
```

### Smoke Tests

```bash
cd aei-core
python test_va_api.py
```

---

## 🔧 Troubleshooting

### API won't start

```bash
# Check logs
docker-compose logs api

# Check port availability
netstat -tulpn | grep 8000

# Verify environment variables
docker-compose config
```

### Database connection errors

```bash
# Test connection
psql -h localhost -U sbf_user -d sbf_db

# Check PostgreSQL status
sudo systemctl status postgresql
```

### Permission errors

```bash
# Fix file permissions
chown -R sbf:sbf /opt/sbf
chmod -R 755 /opt/sbf
```

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  api:
    deploy:
      replicas: 3
    
  nginx:
    image: nginx
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### Load Balancing

```nginx
upstream sbf_api {
    server api-1:8000;
    server api-2:8000;
    server api-3:8000;
}

server {
    location / {
        proxy_pass http://sbf_api;
    }
}
```

---

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] HTTPS/SSL certificates installed
- [ ] API keys generated and secured
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Health checks passing
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Disaster recovery plan created

---

## 📞 Support

**Issues:** Create GitHub issue
**Docs:** Check /docs folder
**API Docs:** https://api.sbf.yourdomain.com/docs

---

**Deployment Engineer:** Ready for production! 🚀  
**Last Updated:** 2025-11-20  
**Version:** 1.0.0
