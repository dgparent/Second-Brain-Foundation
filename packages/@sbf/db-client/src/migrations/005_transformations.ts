/**
 * Migration: 005_transformations
 * 
 * Creates tables for transformation engine:
 * - transformations: Template definitions
 * - transformation_results: Execution results
 * - transformation_configs: Tenant configuration
 * - source_insights: Generated insights
 */

import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  // Enable UUID extension if not exists
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`.execute(db);
  
  // Create output_format enum
  await db.schema
    .createType('output_format')
    .asEnum(['markdown', 'json', 'structured'])
    .execute();
  
  // Create insight_type enum
  await db.schema
    .createType('insight_type')
    .asEnum([
      'summary',
      'key-points',
      'action-items',
      'tags',
      'category',
      'sentiment',
      'entities',
      'topics',
      'questions',
      'custom'
    ])
    .execute();
  
  // Create truth_level enum
  await db.schema
    .createType('truth_level')
    .asEnum(['L1', 'L2', 'L3', 'U1', 'U2'])
    .execute();

  // Create transformations table
  await db.schema
    .createTable('transformations')
    .addColumn('id', 'uuid', col => 
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('tenant_id', 'uuid', col => 
      col.references('tenants.id').onDelete('cascade')
    )
    .addColumn('name', 'varchar(255)', col => col.notNull())
    .addColumn('description', 'text')
    .addColumn('prompt_template', 'text', col => col.notNull())
    .addColumn('output_format', sql`output_format`, col => 
      col.notNull().defaultTo('markdown')
    )
    .addColumn('output_schema', 'jsonb')
    .addColumn('model_id', 'varchar(100)')
    .addColumn('temperature', 'decimal(3,2)')
    .addColumn('max_tokens', 'integer')
    .addColumn('applicable_ingestion_types', 'jsonb', col => 
      col.notNull().defaultTo('[]')
    )
    .addColumn('is_enabled', 'boolean', col => col.notNull().defaultTo(true))
    .addColumn('version', 'integer', col => col.notNull().defaultTo(1))
    .addColumn('created_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create unique constraint for name per tenant (null tenant_id = system default)
  await db.schema
    .createIndex('transformations_tenant_name_unique')
    .on('transformations')
    .columns(['tenant_id', 'name'])
    .unique()
    .execute();
  
  // Index for system defaults (tenant_id IS NULL)
  await sql`
    CREATE INDEX transformations_system_defaults_idx 
    ON transformations (name) 
    WHERE tenant_id IS NULL
  `.execute(db);

  // Create transformation_results table
  await db.schema
    .createTable('transformation_results')
    .addColumn('id', 'uuid', col => 
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('tenant_id', 'uuid', col => 
      col.notNull().references('tenants.id').onDelete('cascade')
    )
    .addColumn('transformation_id', 'uuid', col => 
      col.notNull().references('transformations.id').onDelete('cascade')
    )
    .addColumn('source_id', 'uuid', col => 
      col.references('sources.id').onDelete('set null')
    )
    .addColumn('source_version', 'integer')
    .addColumn('output', 'text', col => col.notNull())
    .addColumn('output_format', sql`output_format`, col => col.notNull())
    .addColumn('input_tokens', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('output_tokens', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('cost', 'decimal(10,6)', col => col.notNull().defaultTo(0))
    .addColumn('duration_ms', 'integer', col => col.notNull().defaultTo(0))
    .addColumn('model_used', 'varchar(100)')
    .addColumn('transformation_version', 'integer')
    .addColumn('error', 'text')
    .addColumn('created_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Index for querying results by source
  await db.schema
    .createIndex('transformation_results_source_idx')
    .on('transformation_results')
    .columns(['source_id', 'tenant_id'])
    .execute();
  
  // Index for querying results by transformation
  await db.schema
    .createIndex('transformation_results_transformation_idx')
    .on('transformation_results')
    .columns(['transformation_id', 'tenant_id'])
    .execute();

  // Create transformation_configs table
  await db.schema
    .createTable('transformation_configs')
    .addColumn('id', 'uuid', col => 
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('tenant_id', 'uuid', col => 
      col.notNull().unique().references('tenants.id').onDelete('cascade')
    )
    .addColumn('daily_limit', 'integer', col => col.notNull().defaultTo(1000))
    .addColumn('auto_generate_insights', 'boolean', col => 
      col.notNull().defaultTo(true)
    )
    .addColumn('default_insight_types', 'jsonb', col => 
      col.notNull().defaultTo('["summary", "key-points", "tags"]')
    )
    .addColumn('max_concurrent', 'integer', col => col.notNull().defaultTo(5))
    .addColumn('enabled_transformations', 'jsonb', col => 
      col.notNull().defaultTo('[]')
    )
    .addColumn('created_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Create source_insights table
  await db.schema
    .createTable('source_insights')
    .addColumn('id', 'uuid', col => 
      col.primaryKey().defaultTo(sql`uuid_generate_v4()`)
    )
    .addColumn('tenant_id', 'uuid', col => 
      col.notNull().references('tenants.id').onDelete('cascade')
    )
    .addColumn('source_id', 'uuid', col => 
      col.notNull().references('sources.id').onDelete('cascade')
    )
    .addColumn('insight_type', sql`insight_type`, col => col.notNull())
    .addColumn('content', 'text', col => col.notNull())
    .addColumn('structured_data', 'jsonb')
    .addColumn('truth_level', sql`truth_level`, col => 
      col.notNull().defaultTo('L3')
    )
    .addColumn('confidence', 'decimal(3,2)')
    .addColumn('transformation_id', 'uuid', col => 
      col.references('transformations.id').onDelete('set null')
    )
    .addColumn('transformation_result_id', 'uuid', col => 
      col.references('transformation_results.id').onDelete('set null')
    )
    .addColumn('promoted_by', 'uuid', col => 
      col.references('users.id').onDelete('set null')
    )
    .addColumn('promoted_at', 'timestamptz')
    .addColumn('invalidated_at', 'timestamptz')
    .addColumn('created_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .addColumn('updated_at', 'timestamptz', col => 
      col.notNull().defaultTo(sql`now()`)
    )
    .execute();

  // Index for querying insights by source
  await db.schema
    .createIndex('source_insights_source_idx')
    .on('source_insights')
    .columns(['source_id', 'tenant_id'])
    .execute();
  
  // Index for querying by insight type
  await db.schema
    .createIndex('source_insights_type_idx')
    .on('source_insights')
    .columns(['insight_type', 'tenant_id'])
    .execute();
  
  // Index for valid (non-invalidated) insights
  await sql`
    CREATE INDEX source_insights_valid_idx 
    ON source_insights (source_id, tenant_id) 
    WHERE invalidated_at IS NULL
  `.execute(db);

  // Enable Row Level Security
  await sql`ALTER TABLE transformations ENABLE ROW LEVEL SECURITY`.execute(db);
  await sql`ALTER TABLE transformation_results ENABLE ROW LEVEL SECURITY`.execute(db);
  await sql`ALTER TABLE transformation_configs ENABLE ROW LEVEL SECURITY`.execute(db);
  await sql`ALTER TABLE source_insights ENABLE ROW LEVEL SECURITY`.execute(db);

  // RLS Policies for transformations (read system defaults + tenant specific)
  await sql`
    CREATE POLICY transformations_tenant_read ON transformations
    FOR SELECT
    USING (tenant_id IS NULL OR tenant_id = current_setting('app.tenant_id')::uuid)
  `.execute(db);
  
  await sql`
    CREATE POLICY transformations_tenant_write ON transformations
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
  `.execute(db);

  // RLS Policies for transformation_results
  await sql`
    CREATE POLICY transformation_results_tenant ON transformation_results
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
  `.execute(db);

  // RLS Policies for transformation_configs
  await sql`
    CREATE POLICY transformation_configs_tenant ON transformation_configs
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
  `.execute(db);

  // RLS Policies for source_insights
  await sql`
    CREATE POLICY source_insights_tenant ON source_insights
    FOR ALL
    USING (tenant_id = current_setting('app.tenant_id')::uuid)
    WITH CHECK (tenant_id = current_setting('app.tenant_id')::uuid)
  `.execute(db);

  // Create updated_at trigger function if not exists
  await sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql'
  `.execute(db);

  // Add triggers for updated_at
  await sql`
    CREATE TRIGGER transformations_updated_at
    BEFORE UPDATE ON transformations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
  
  await sql`
    CREATE TRIGGER transformation_configs_updated_at
    BEFORE UPDATE ON transformation_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
  
  await sql`
    CREATE TRIGGER source_insights_updated_at
    BEFORE UPDATE ON source_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
  `.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Drop triggers
  await sql`DROP TRIGGER IF EXISTS source_insights_updated_at ON source_insights`.execute(db);
  await sql`DROP TRIGGER IF EXISTS transformation_configs_updated_at ON transformation_configs`.execute(db);
  await sql`DROP TRIGGER IF EXISTS transformations_updated_at ON transformations`.execute(db);
  
  // Drop tables
  await db.schema.dropTable('source_insights').ifExists().execute();
  await db.schema.dropTable('transformation_configs').ifExists().execute();
  await db.schema.dropTable('transformation_results').ifExists().execute();
  await db.schema.dropTable('transformations').ifExists().execute();
  
  // Drop types
  await db.schema.dropType('truth_level').ifExists().execute();
  await db.schema.dropType('insight_type').ifExists().execute();
  await db.schema.dropType('output_format').ifExists().execute();
}
