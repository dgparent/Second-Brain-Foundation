/**
 * Migration 004: LangGraph Checkpoints
 * 
 * Creates the checkpoint table for LangGraph conversation persistence:
 * - langgraph_checkpoints: Stores conversation state with tenant isolation
 * - chat_sessions: Tracks chat session metadata
 */

import { Migration, MigrationDatabase } from '../types';

export const migration004LangGraphCheckpoints: Migration = {
  version: '004',
  name: 'langgraph_checkpoints',
  description: 'Create LangGraph checkpoints table for conversation persistence',
  reversible: true,
  
  async up(db: MigrationDatabase): Promise<void> {
    // LangGraph checkpoints table - stores conversation state
    await db.execute(`
      CREATE TABLE IF NOT EXISTS langgraph_checkpoints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        thread_id TEXT NOT NULL,
        checkpoint_id TEXT NOT NULL,
        parent_checkpoint_id TEXT,
        checkpoint JSONB NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, thread_id, checkpoint_id)
      );
    `);
    
    // Index for efficient lookups by tenant and thread
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_checkpoints_tenant_thread 
      ON langgraph_checkpoints(tenant_id, thread_id, created_at DESC);
    `);
    
    // Index for checkpoint lineage queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_checkpoints_parent 
      ON langgraph_checkpoints(parent_checkpoint_id) 
      WHERE parent_checkpoint_id IS NOT NULL;
    `);
    
    // Enable Row-Level Security for multi-tenant isolation
    await db.execute(`
      ALTER TABLE langgraph_checkpoints ENABLE ROW LEVEL SECURITY;
    `);
    
    // RLS policy using session variable for tenant context
    await db.execute(`
      CREATE POLICY tenant_isolation_checkpoints ON langgraph_checkpoints
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
    `);
    
    // Chat sessions table - tracks session metadata
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        thread_id TEXT NOT NULL,
        title TEXT,
        notebook_id UUID,
        model_override TEXT,
        context_config JSONB DEFAULT '{}',
        message_count INTEGER DEFAULT 0,
        last_message_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, thread_id)
      );
    `);
    
    // Indexes for chat sessions
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_tenant 
      ON chat_sessions(tenant_id, created_at DESC);
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_user 
      ON chat_sessions(user_id, created_at DESC) 
      WHERE user_id IS NOT NULL;
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chat_sessions_notebook 
      ON chat_sessions(notebook_id) 
      WHERE notebook_id IS NOT NULL;
    `);
    
    // Enable RLS for chat sessions
    await db.execute(`
      ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
    `);
    
    await db.execute(`
      CREATE POLICY tenant_isolation_chat_sessions ON chat_sessions
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
    `);
    
    // Chat messages table - for quick message queries without parsing checkpoints
    await db.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
        content TEXT NOT NULL,
        tokens_used INTEGER,
        model_used TEXT,
        citations JSONB DEFAULT '[]',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    
    // Indexes for chat messages
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
      ON chat_messages(session_id, created_at ASC);
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant 
      ON chat_messages(tenant_id, created_at DESC);
    `);
    
    // Enable RLS for chat messages
    await db.execute(`
      ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
    `);
    
    await db.execute(`
      CREATE POLICY tenant_isolation_chat_messages ON chat_messages
      FOR ALL
      USING (tenant_id = current_setting('app.current_tenant_id', true)::UUID);
    `);
    
    // Trigger to update message_count and last_message_at on chat_sessions
    await db.execute(`
      CREATE OR REPLACE FUNCTION update_chat_session_stats()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE chat_sessions 
        SET 
          message_count = message_count + 1,
          last_message_at = NEW.created_at,
          updated_at = NOW()
        WHERE id = NEW.session_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await db.execute(`
      CREATE TRIGGER trg_chat_message_insert
      AFTER INSERT ON chat_messages
      FOR EACH ROW
      EXECUTE FUNCTION update_chat_session_stats();
    `);
  },
  
  async down(db: MigrationDatabase): Promise<void> {
    // Drop triggers first
    await db.execute(`DROP TRIGGER IF EXISTS trg_chat_message_insert ON chat_messages;`);
    await db.execute(`DROP FUNCTION IF EXISTS update_chat_session_stats();`);
    
    // Drop RLS policies
    await db.execute(`DROP POLICY IF EXISTS tenant_isolation_chat_messages ON chat_messages;`);
    await db.execute(`DROP POLICY IF EXISTS tenant_isolation_chat_sessions ON chat_sessions;`);
    await db.execute(`DROP POLICY IF EXISTS tenant_isolation_checkpoints ON langgraph_checkpoints;`);
    
    // Drop tables in reverse order
    await db.execute(`DROP TABLE IF EXISTS chat_messages;`);
    await db.execute(`DROP TABLE IF EXISTS chat_sessions;`);
    await db.execute(`DROP TABLE IF EXISTS langgraph_checkpoints;`);
  },
};
