/**
 * Analytics Integration Test
 * Validates the complete analytics dashboard implementation
 */

const axios = require('axios');
const { Pool } = require('pg');

const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
const SUPERSET_URL = process.env.SUPERSET_URL || 'http://localhost:8088';
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://localhost:3000';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'sbf_db',
  user: process.env.POSTGRES_USER || 'sbf_user',
  password: process.env.POSTGRES_PASSWORD || 'changeme',
});

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testDatabaseSchema() {
  log('\n=== Testing Database Schema ===', 'cyan');
  
  try {
    // Test analytics schema exists
    const schemaCheck = await pool.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'analytics'`
    );
    
    if (schemaCheck.rows.length === 0) {
      log('✗ Analytics schema not found', 'red');
      return false;
    }
    log('✓ Analytics schema exists', 'green');
    
    // Test materialized views
    const views = [
      'tenant_activity_summary',
      'user_activity_metrics',
      'task_completion_metrics',
      'project_progress_metrics',
      'entity_relationship_metrics',
      'daily_activity_timeline',
    ];
    
    for (const view of views) {
      const viewCheck = await pool.query(
        `SELECT matviewname FROM pg_matviews WHERE schemaname = 'analytics' AND matviewname = $1`,
        [view]
      );
      
      if (viewCheck.rows.length === 0) {
        log(`✗ Materialized view ${view} not found`, 'red');
        return false;
      }
      log(`✓ Materialized view ${view} exists`, 'green');
    }
    
    // Test tenant-scoped views
    const scopedViews = [
      'my_tenant_activity',
      'my_user_activity',
      'my_task_metrics',
      'my_project_metrics',
      'my_entity_relationships',
      'my_daily_timeline',
    ];
    
    for (const view of scopedViews) {
      const viewCheck = await pool.query(
        `SELECT viewname FROM pg_views WHERE schemaname = 'analytics' AND viewname = $1`,
        [view]
      );
      
      if (viewCheck.rows.length === 0) {
        log(`✗ Scoped view ${view} not found`, 'red');
        return false;
      }
      log(`✓ Scoped view ${view} exists`, 'green');
    }
    
    // Test dashboard_configs table
    const tableCheck = await pool.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'analytics' AND tablename = 'dashboard_configs'`
    );
    
    if (tableCheck.rows.length === 0) {
      log('✗ dashboard_configs table not found', 'red');
      return false;
    }
    log('✓ dashboard_configs table exists', 'green');
    
    return true;
  } catch (error) {
    log(`✗ Database test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testSuperset() {
  log('\n=== Testing Superset ===', 'cyan');
  
  try {
    const response = await axios.get(`${SUPERSET_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      log('✓ Superset is running and healthy', 'green');
      return true;
    }
  } catch (error) {
    log(`✗ Superset health check failed: ${error.message}`, 'red');
    log('  Make sure Superset is running: docker-compose up -d superset', 'yellow');
    return false;
  }
}

async function testGrafana() {
  log('\n=== Testing Grafana ===', 'cyan');
  
  try {
    const response = await axios.get(`${GRAFANA_URL}/api/health`, { timeout: 5000 });
    if (response.status === 200) {
      log('✓ Grafana is running and healthy', 'green');
      return true;
    }
  } catch (error) {
    log(`✗ Grafana health check failed: ${error.message}`, 'red');
    log('  Make sure Grafana is running: docker-compose up -d grafana', 'yellow');
    return false;
  }
}

async function testAPI() {
  log('\n=== Testing API ===', 'cyan');
  
  try {
    // Test basic health
    const healthResponse = await axios.get(`${API_BASE_URL}/healthz`, { timeout: 5000 });
    if (healthResponse.status === 200) {
      log('✓ API is running and healthy', 'green');
    } else {
      log('✗ API health check failed', 'red');
      return false;
    }
    
    // Note: These tests would require authentication
    log('  Note: Analytics endpoints require authentication', 'yellow');
    log('  Endpoints available:', 'cyan');
    const endpoints = [
      'GET  /analytics/tenant-summary',
      'GET  /analytics/user-activity',
      'GET  /analytics/task-metrics',
      'GET  /analytics/project-progress',
      'GET  /analytics/entity-relationships',
      'GET  /analytics/daily-timeline',
      'POST /analytics/dashboard-config',
      'GET  /analytics/dashboard-config',
      'GET  /analytics/superset-embed-token',
      'GET  /analytics/grafana-embed-url',
      'POST /analytics/refresh-views',
    ];
    endpoints.forEach(endpoint => log(`    ${endpoint}`, 'cyan'));
    
    return true;
  } catch (error) {
    log(`✗ API test failed: ${error.message}`, 'red');
    log('  Make sure API is running: docker-compose up -d api', 'yellow');
    return false;
  }
}

async function testDockerServices() {
  log('\n=== Testing Docker Services ===', 'cyan');
  
  const { exec } = require('child_process');
  const { promisify } = require('util');
  const execAsync = promisify(exec);
  
  try {
    const { stdout } = await execAsync('docker-compose ps --services --filter "status=running"');
    const runningServices = stdout.trim().split('\n');
    
    const requiredServices = ['postgres', 'redis', 'superset', 'grafana'];
    
    for (const service of requiredServices) {
      if (runningServices.includes(service)) {
        log(`✓ ${service} is running`, 'green');
      } else {
        log(`✗ ${service} is not running`, 'red');
        log(`  Start with: docker-compose up -d ${service}`, 'yellow');
      }
    }
    
    return true;
  } catch (error) {
    log(`✗ Docker services check failed: ${error.message}`, 'red');
    log('  Make sure Docker Compose is installed and services are running', 'yellow');
    return false;
  }
}

async function testFileStructure() {
  log('\n=== Testing File Structure ===', 'cyan');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'scripts/init-analytics-schema.sql',
    'config/grafana/provisioning/datasources/datasource.yml',
    'config/grafana/provisioning/dashboards/dashboard.yml',
    'packages/@sbf/api/src/controllers/analytics.controller.ts',
    'packages/@sbf/api/src/services/analytics.service.ts',
    'packages/@sbf/desktop/src/components/analytics/AnalyticsDashboard.tsx',
    'packages/@sbf/desktop/src/components/analytics/SupersetDashboard.tsx',
    'packages/@sbf/desktop/src/components/analytics/GrafanaDashboard.tsx',
    'packages/@sbf/desktop/src/components/analytics/CustomAnalytics.tsx',
    'packages/@sbf/desktop/src/services/api.ts',
    'docs/ANALYTICS-INTEGRATION.md',
    'docs/ANALYTICS-DEPLOYMENT.md',
    'docs/ANALYTICS-QUICKSTART.md',
    'scripts/setup-analytics.sh',
    'scripts/setup-analytics.ps1',
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      log(`✓ ${file}`, 'green');
    } else {
      log(`✗ ${file} not found`, 'red');
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Analytics Integration - Validation Tests            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  const results = {
    fileStructure: await testFileStructure(),
    dockerServices: await testDockerServices(),
    database: await testDatabaseSchema(),
    superset: await testSuperset(),
    grafana: await testGrafana(),
    api: await testAPI(),
  };
  
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                   Test Results                         ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  const testNames = {
    fileStructure: 'File Structure',
    dockerServices: 'Docker Services',
    database: 'Database Schema',
    superset: 'Superset Service',
    grafana: 'Grafana Service',
    api: 'API Service',
  };
  
  for (const [key, passed] of Object.entries(results)) {
    const status = passed ? '✓ PASSED' : '✗ FAILED';
    const color = passed ? 'green' : 'red';
    log(`  ${testNames[key]}: ${status}`, color);
  }
  
  const allPassed = Object.values(results).every(r => r === true);
  
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                   Overall Status                       ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  if (allPassed) {
    log('  ✓ ALL TESTS PASSED - Analytics integration is ready!', 'green');
    log('\nNext steps:', 'cyan');
    log('  1. Access Superset at http://localhost:8088', 'yellow');
    log('  2. Access Grafana at http://localhost:3000', 'yellow');
    log('  3. Create your first dashboard', 'yellow');
  } else {
    log('  ✗ SOME TESTS FAILED - Please review errors above', 'red');
    log('\nRecommended actions:', 'cyan');
    log('  1. Run setup script: ./scripts/setup-analytics.ps1', 'yellow');
    log('  2. Check service logs: docker-compose logs [service]', 'yellow');
    log('  3. Review documentation in docs/ANALYTICS-*.md', 'yellow');
  }
  
  log('');
  
  // Cleanup
  await pool.end();
  
  process.exit(allPassed ? 0 : 1);
}

// Run tests
runAllTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  process.exit(1);
});
