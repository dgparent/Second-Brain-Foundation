#!/bin/bash
# Analytics Integration Setup Script
# Second Brain Foundation - Analytics Dashboard Setup

set -e

echo "=================================================="
echo "SBF Analytics Dashboard - Setup Script"
echo "=================================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}! .env file not found, copying from .env.example${NC}"
    cp .env.example .env
    echo -e "${YELLOW}! Please update .env with your configuration${NC}"
    echo -e "${YELLOW}! Especially: SUPERSET_SECRET_KEY, GRAFANA_ADMIN_PASSWORD${NC}"
fi

echo -e "${GREEN}✓ Environment configuration found${NC}"

# Step 1: Start PostgreSQL and Redis
echo ""
echo "Step 1: Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U sbf_user > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Error: PostgreSQL failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# Step 2: Initialize analytics schema
echo ""
echo "Step 2: Initializing analytics schema..."
if docker-compose exec -T postgres psql -U sbf_user -d sbf_db -f /docker-entrypoint-initdb.d/init-analytics-schema.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Analytics schema initialized${NC}"
else
    # Try alternative path
    if docker-compose exec -T postgres psql -U sbf_user -d sbf_db < scripts/init-analytics-schema.sql; then
        echo -e "${GREEN}✓ Analytics schema initialized${NC}"
    else
        echo -e "${RED}Error: Failed to initialize analytics schema${NC}"
        exit 1
    fi
fi

# Step 3: Start Superset
echo ""
echo "Step 3: Starting Apache Superset (this may take a few minutes)..."
docker-compose up -d superset

echo "Waiting for Superset to initialize..."
for i in {1..60}; do
    if curl -s http://localhost:8088/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Superset is ready${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${YELLOW}! Superset is still starting, check logs: docker logs sbf-superset${NC}"
    fi
    sleep 2
done

# Step 4: Start Grafana
echo ""
echo "Step 4: Starting Grafana..."
docker-compose up -d grafana

echo "Waiting for Grafana to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Grafana is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}! Grafana is still starting, check logs: docker logs sbf-grafana${NC}"
    fi
    sleep 1
done

# Step 5: Start API
echo ""
echo "Step 5: Starting SBF API..."
docker-compose up -d api

echo "Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/healthz > /dev/null 2>&1; then
        echo -e "${GREEN}✓ API is ready${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${YELLOW}! API is still starting, check logs: docker logs sbf-api${NC}"
    fi
    sleep 1
done

# Summary
echo ""
echo "=================================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=================================================="
echo ""
echo "Services are now running:"
echo ""
echo "  📊 Superset:    http://localhost:8088"
echo "     Username: admin"
echo "     Password: (from SUPERSET_ADMIN_PASSWORD in .env)"
echo ""
echo "  📈 Grafana:     http://localhost:3000"
echo "     Username: admin"
echo "     Password: (from GRAFANA_ADMIN_PASSWORD in .env)"
echo ""
echo "  🔧 API:         http://localhost:8000"
echo ""
echo "Next steps:"
echo "  1. Configure Superset database connection:"
echo "     - Go to http://localhost:8088"
echo "     - Navigate to Data → Databases → + Database"
echo "     - Select PostgreSQL"
echo "     - URI: postgresql://sbf_user:<password>@postgres:5432/sbf_db"
echo ""
echo "  2. Create dashboards in Superset and Grafana"
echo ""
echo "  3. Test analytics endpoints:"
echo "     curl http://localhost:8000/analytics/tenant-summary"
echo ""
echo "View logs:"
echo "  docker-compose logs -f superset"
echo "  docker-compose logs -f grafana"
echo "  docker-compose logs -f api"
echo ""
echo "=================================================="
