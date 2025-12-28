/**
 * Migration 001: Core Schema
 * 
 * Creates the foundational tables for SBF:
 * - tenants: Multi-tenant support
 * - users: User accounts
 * - entities: Base entity tracking
 */

import { Migration, MigrationDatabase } from '../types';

export const migration001CoreSchema: Migration = {
  version: '001',
  name: 'core_schema',
  description: 'Creates foundational tables: tenants, users, entities',
  reversible: true,

  async up(db: MigrationDatabase): Promise<void> {
    // Enable required extensions
    await db.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await db.execute('CREATE EXTENSION IF NOT EXISTS "vector"');

    // Create tenants table
    await db.createTable('tenants', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'name', type: 'varchar', nullable: false },
      { name: 'slug', type: 'varchar', nullable: false, unique: true },
      { name: 'settings', type: 'jsonb', defaultValue: '{}' },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
      { name: 'deleted_at', type: 'timestamptz', nullable: true },
    ]);

    // Create users table
    await db.createTable('users', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'tenant_id', type: 'uuid', nullable: false, references: { 
        table: 'tenants', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'email', type: 'varchar', nullable: false },
      { name: 'name', type: 'varchar', nullable: true },
      { name: 'avatar_url', type: 'text', nullable: true },
      { name: 'settings', type: 'jsonb', defaultValue: '{}' },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
      { name: 'deleted_at', type: 'timestamptz', nullable: true },
    ]);

    // Create unique index on tenant + email
    await db.createIndex('users', 'idx_users_tenant_email', ['tenant_id', 'email'], {
      unique: true,
      where: 'deleted_at IS NULL',
    });

    // Create entities table (base for all SBF entities)
    await db.createTable('entities', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'tenant_id', type: 'uuid', nullable: false, references: { 
        table: 'tenants', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'user_id', type: 'uuid', nullable: true, references: { 
        table: 'users', column: 'id', onDelete: 'SET NULL' 
      }},
      { name: 'entity_type', type: 'varchar', nullable: false },
      { name: 'title', type: 'text', nullable: true },
      { name: 'content', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', defaultValue: '{}' },
      { name: 'lifecycle_state', type: 'varchar', nullable: false, defaultValue: 'active' },
      { name: 'sensitivity_level', type: 'varchar', nullable: false, defaultValue: 'normal' },
      { name: 'dissolve_at', type: 'timestamptz', nullable: true },
      { name: 'checksum', type: 'varchar', nullable: true },
      { name: 'created_at', type: 'timestamptz', nullable: false },
      { name: 'updated_at', type: 'timestamptz', nullable: false },
      { name: 'deleted_at', type: 'timestamptz', nullable: true },
    ]);

    // Create indexes for entities
    await db.createIndex('entities', 'idx_entities_tenant', ['tenant_id']);
    await db.createIndex('entities', 'idx_entities_type', ['tenant_id', 'entity_type']);
    await db.createIndex('entities', 'idx_entities_lifecycle', ['lifecycle_state']);
    await db.createIndex('entities', 'idx_entities_dissolve', ['dissolve_at'], {
      where: 'dissolve_at IS NOT NULL',
    });

    // Create entity_relationships table
    await db.createTable('entity_relationships', [
      { name: 'id', type: 'uuid', primaryKey: true },
      { name: 'tenant_id', type: 'uuid', nullable: false, references: { 
        table: 'tenants', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'source_entity_id', type: 'uuid', nullable: false, references: { 
        table: 'entities', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'target_entity_id', type: 'uuid', nullable: false, references: { 
        table: 'entities', column: 'id', onDelete: 'CASCADE' 
      }},
      { name: 'relationship_type', type: 'varchar', nullable: false },
      { name: 'metadata', type: 'jsonb', defaultValue: '{}' },
      { name: 'created_at', type: 'timestamptz', nullable: false },
    ]);

    // Create indexes for relationships
    await db.createIndex('entity_relationships', 'idx_rel_source', ['source_entity_id']);
    await db.createIndex('entity_relationships', 'idx_rel_target', ['target_entity_id']);
    await db.createIndex('entity_relationships', 'idx_rel_type', ['relationship_type']);
  },

  async down(db: MigrationDatabase): Promise<void> {
    await db.dropTable('entity_relationships');
    await db.dropTable('entities');
    await db.dropTable('users');
    await db.dropTable('tenants');
  },
};
