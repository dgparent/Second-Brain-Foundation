#!/usr/bin/env node
/**
 * @sbf/db-migrations - CLI
 * 
 * Command-line interface for running migrations.
 */

import { MigrationManager } from './MigrationManager';
import { PostgresAdapter } from './adapters/postgres';
import { getBuiltInMigrations } from './migrations';
import { MigrationDirection } from './types';

const HELP = `
sbf-migrate - Database Migration Tool

Usage:
  sbf-migrate <command> [options]

Commands:
  up              Run all pending migrations
  down            Rollback last migration
  status          Show migration status
  reset           Rollback all migrations
  create <name>   Create a new migration file

Options:
  --dry-run       Show what would be done without executing
  --help          Show this help message

Environment Variables:
  DATABASE_URL    PostgreSQL connection string

Examples:
  sbf-migrate up
  sbf-migrate down
  sbf-migrate status
  sbf-migrate up --dry-run
  sbf-migrate create add_users_table
`;

async function createManager(dryRun = false): Promise<MigrationManager> {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL environment variable is required');
    process.exit(1);
  }

  // Lazy import pg to avoid requiring it if not installed
  let pg: any;
  try {
    pg = require('pg');
  } catch (e) {
    console.error('Error: pg package is required. Install it with: pnpm add pg');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  const adapter = new PostgresAdapter({ pool });
  
  const manager = new MigrationManager({
    database: adapter,
    dryRun,
    logger: {
      debug: (msg) => console.log(`  ${msg}`),
      info: (msg) => console.log(`✓ ${msg}`),
      warn: (msg) => console.warn(`⚠ ${msg}`),
      error: (msg) => console.error(`✗ ${msg}`),
    },
  });

  // Register built-in migrations
  manager.registerAll(getBuiltInMigrations());

  return manager;
}

async function showStatus(manager: MigrationManager): Promise<void> {
  const status = await manager.getStatus();

  console.log('\nMigration Status:');
  console.log('─'.repeat(60));

  if (status.applied.length > 0) {
    console.log('\nApplied migrations:');
    for (const record of status.applied) {
      console.log(`  ✓ ${record.version} - ${record.name} (${record.appliedAt})`);
    }
  } else {
    console.log('\nNo migrations applied yet.');
  }

  if (status.pending.length > 0) {
    console.log('\nPending migrations:');
    for (const migration of status.pending) {
      console.log(`  ○ ${migration.version} - ${migration.name}`);
    }
  } else {
    console.log('\n✓ Database is up to date!');
  }

  console.log(`\nCurrent version: ${status.currentVersion || 'none'}`);
}

async function runUp(manager: MigrationManager): Promise<void> {
  console.log('\nRunning migrations...');
  
  const result = await manager.up();
  
  if (result.results.length === 0) {
    console.log('No pending migrations to run.');
    return;
  }

  console.log('\nResults:');
  for (const r of result.results) {
    const status = r.success ? '✓' : '✗';
    console.log(`  ${status} ${r.version} - ${r.name} (${r.executionTimeMs}ms)`);
    if (r.error) {
      console.log(`    Error: ${r.error.message}`);
    }
  }

  console.log(`\nTotal: ${result.successCount} succeeded, ${result.failedCount} failed`);
  console.log(`Time: ${result.totalTimeMs}ms`);

  if (!result.success) {
    process.exit(1);
  }
}

async function runDown(manager: MigrationManager): Promise<void> {
  console.log('\nRolling back last migration...');
  
  const result = await manager.down();
  
  if (!result) {
    console.log('No migrations to rollback.');
    return;
  }

  const status = result.success ? '✓' : '✗';
  console.log(`  ${status} ${result.version} - ${result.name} (${result.executionTimeMs}ms)`);
  
  if (result.error) {
    console.log(`    Error: ${result.error.message}`);
    process.exit(1);
  }
}

async function runReset(manager: MigrationManager): Promise<void> {
  console.log('\nResetting database (rolling back all migrations)...');
  
  const result = await manager.reset();
  
  if (result.results.length === 0) {
    console.log('No migrations to rollback.');
    return;
  }

  console.log('\nResults:');
  for (const r of result.results) {
    const status = r.success ? '✓' : '✗';
    console.log(`  ${status} ${r.version} - ${r.name} (${r.executionTimeMs}ms)`);
    if (r.error) {
      console.log(`    Error: ${r.error.message}`);
    }
  }

  console.log(`\nTotal: ${result.successCount} rolled back, ${result.failedCount} failed`);

  if (!result.success) {
    process.exit(1);
  }
}

function createMigration(name: string): void {
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const version = timestamp;
  const content = MigrationManager.createMigration(version, name);
  
  const filename = `${version}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.ts`;
  console.log(`\nMigration template (save as ${filename}):\n`);
  console.log(content);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(HELP);
    return;
  }

  const command = args[0];
  const dryRun = args.includes('--dry-run');

  try {
    switch (command) {
      case 'up': {
        const manager = await createManager(dryRun);
        await runUp(manager);
        break;
      }
      
      case 'down': {
        const manager = await createManager(dryRun);
        await runDown(manager);
        break;
      }
      
      case 'status': {
        const manager = await createManager(true); // Always dry-run for status
        await showStatus(manager);
        break;
      }
      
      case 'reset': {
        const manager = await createManager(dryRun);
        await runReset(manager);
        break;
      }
      
      case 'create': {
        const name = args[1];
        if (!name) {
          console.error('Error: Migration name is required');
          console.log('Usage: sbf-migrate create <name>');
          process.exit(1);
        }
        createMigration(name);
        break;
      }
      
      default:
        console.error(`Unknown command: ${command}`);
        console.log(HELP);
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  process.exit(0);
}

main();
