# Analytics Integration Setup Script (PowerShell)
# Second Brain Foundation - Analytics Dashboard Setup

$ErrorActionPreference = "Stop"

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "SBF Analytics Dashboard - Setup Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Error: Docker is not running" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "! .env file not found, copying from .env.example" -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "! Please update .env with your configuration" -ForegroundColor Yellow
    Write-Host "! Especially: SUPERSET_SECRET_KEY, GRAFANA_ADMIN_PASSWORD" -ForegroundColor Yellow
}

Write-Host "✓ Environment configuration found" -ForegroundColor Green

# Step 1: Start PostgreSQL and Redis
Write-Host ""
Write-Host "Step 1: Starting PostgreSQL and Redis..." -ForegroundColor Cyan
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        docker-compose exec -T postgres pg_isready -U sbf_user | Out-Null
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
        break
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Host "Error: PostgreSQL failed to start" -ForegroundColor Red
            exit 1
        }
        Start-Sleep -Seconds 1
    }
}

# Step 2: Initialize analytics schema
Write-Host ""
Write-Host "Step 2: Initializing analytics schema..." -ForegroundColor Cyan
try {
    Get-Content .\scripts\init-analytics-schema.sql | docker-compose exec -T postgres psql -U sbf_user -d sbf_db | Out-Null
    Write-Host "✓ Analytics schema initialized" -ForegroundColor Green
} catch {
    Write-Host "Error: Failed to initialize analytics schema" -ForegroundColor Red
    Write-Host "You can manually run: docker-compose exec postgres psql -U sbf_user -d sbf_db < scripts\init-analytics-schema.sql" -ForegroundColor Yellow
}

# Step 3: Start Superset
Write-Host ""
Write-Host "Step 3: Starting Apache Superset (this may take a few minutes)..." -ForegroundColor Cyan
docker-compose up -d superset

Write-Host "Waiting for Superset to initialize..." -ForegroundColor Yellow
$maxAttempts = 60
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8088/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Superset is ready" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Host "! Superset is still starting, check logs: docker logs sbf-superset" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 2
    }
}

# Step 4: Start Grafana
Write-Host ""
Write-Host "Step 4: Starting Grafana..." -ForegroundColor Cyan
docker-compose up -d grafana

Write-Host "Waiting for Grafana to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Grafana is ready" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Host "! Grafana is still starting, check logs: docker logs sbf-grafana" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 1
    }
}

# Step 5: Start API
Write-Host ""
Write-Host "Step 5: Starting SBF API..." -ForegroundColor Cyan
docker-compose up -d api

Write-Host "Waiting for API to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
for ($i = 1; $i -le $maxAttempts; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/healthz" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ API is ready" -ForegroundColor Green
            break
        }
    } catch {
        if ($i -eq $maxAttempts) {
            Write-Host "! API is still starting, check logs: docker logs sbf-api" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 1
    }
}

# Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services are now running:" -ForegroundColor White
Write-Host ""
Write-Host "  📊 Superset:    http://localhost:8088" -ForegroundColor Cyan
Write-Host "     Username: admin" -ForegroundColor Gray
Write-Host "     Password: (from SUPERSET_ADMIN_PASSWORD in .env)" -ForegroundColor Gray
Write-Host ""
Write-Host "  📈 Grafana:     http://localhost:3000" -ForegroundColor Cyan
Write-Host "     Username: admin" -ForegroundColor Gray
Write-Host "     Password: (from GRAFANA_ADMIN_PASSWORD in .env)" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔧 API:         http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Configure Superset database connection:" -ForegroundColor White
Write-Host "     - Go to http://localhost:8088" -ForegroundColor Gray
Write-Host "     - Navigate to Data → Databases → + Database" -ForegroundColor Gray
Write-Host "     - Select PostgreSQL" -ForegroundColor Gray
Write-Host "     - URI: postgresql://sbf_user:<password>@postgres:5432/sbf_db" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Create dashboards in Superset and Grafana" -ForegroundColor White
Write-Host ""
Write-Host "  3. Test analytics endpoints:" -ForegroundColor White
Write-Host "     Invoke-WebRequest http://localhost:8000/analytics/tenant-summary" -ForegroundColor Gray
Write-Host ""
Write-Host "View logs:" -ForegroundColor Yellow
Write-Host "  docker-compose logs -f superset" -ForegroundColor Gray
Write-Host "  docker-compose logs -f grafana" -ForegroundColor Gray
Write-Host "  docker-compose logs -f api" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
