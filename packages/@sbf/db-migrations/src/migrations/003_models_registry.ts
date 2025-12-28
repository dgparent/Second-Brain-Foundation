/**
 * Migration 003: Models Registry
 * 
 * Creates the model registry for AI model management:
 * - models: Catalog of available AI models
 * - default_models: Per-tenant default model configuration
 */

import { Migration, MigrationDatabase } from '../types';

export const migration003ModelsRegistry: Migration = {
  version: '003',
  name: 'models_registry',
  description: 'Create models registry and per-tenant defaults',
  reversible: true,
  
  async up(db: MigrationDatabase): Promise<void> {
    // Models table - catalog of all available AI models
    await db.execute(`
      CREATE TABLE IF NOT EXISTS models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('language', 'embedding', 'tts', 'stt', 'image')),
        model_id VARCHAR(255) NOT NULL,
        config JSONB DEFAULT '{}',
        capabilities JSONB DEFAULT '{}',
        cost_per_million_input DECIMAL(10, 6),
        cost_per_million_output DECIMAL(10, 6),
        is_local BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(provider, model_id)
      );
    `);
    
    // Create index for common queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_models_provider ON models(provider);
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_models_type ON models(type);
    `);
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_models_active ON models(is_active) WHERE is_active = true;
    `);
    
    // Default models per tenant
    await db.execute(`
      CREATE TABLE IF NOT EXISTS default_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        default_chat_model UUID REFERENCES models(id),
        default_transformation_model UUID REFERENCES models(id),
        default_embedding_model UUID REFERENCES models(id),
        default_tts_model UUID REFERENCES models(id),
        default_stt_model UUID REFERENCES models(id),
        large_context_model UUID REFERENCES models(id),
        allow_cloud_for_personal BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(tenant_id)
      );
    `);
    
    // Seed common models
    await db.execute(`
      INSERT INTO models (name, provider, type, model_id, capabilities, cost_per_million_input, cost_per_million_output, is_local)
      VALUES
        -- OpenAI Language Models
        ('GPT-4o', 'openai', 'language', 'gpt-4o', '{"max_tokens": 128000, "supports_streaming": true, "supports_json": true}', 2.50, 10.00, false),
        ('GPT-4o Mini', 'openai', 'language', 'gpt-4o-mini', '{"max_tokens": 128000, "supports_streaming": true, "supports_json": true}', 0.15, 0.60, false),
        ('GPT-4 Turbo', 'openai', 'language', 'gpt-4-turbo', '{"max_tokens": 128000, "supports_streaming": true, "supports_json": true}', 10.00, 30.00, false),
        ('GPT-3.5 Turbo', 'openai', 'language', 'gpt-3.5-turbo', '{"max_tokens": 16385, "supports_streaming": true, "supports_json": true}', 0.50, 1.50, false),
        
        -- Anthropic Language Models
        ('Claude 3.5 Sonnet', 'anthropic', 'language', 'claude-3-5-sonnet-20241022', '{"max_tokens": 200000, "supports_streaming": true}', 3.00, 15.00, false),
        ('Claude 3.5 Haiku', 'anthropic', 'language', 'claude-3-5-haiku-20241022', '{"max_tokens": 200000, "supports_streaming": true}', 0.80, 4.00, false),
        ('Claude 3 Opus', 'anthropic', 'language', 'claude-3-opus-20240229', '{"max_tokens": 200000, "supports_streaming": true}', 15.00, 75.00, false),
        
        -- Google Language Models
        ('Gemini 2.0 Flash', 'google', 'language', 'gemini-2.0-flash-exp', '{"max_tokens": 1000000, "supports_streaming": true}', 0.075, 0.30, false),
        ('Gemini 1.5 Pro', 'google', 'language', 'gemini-1.5-pro', '{"max_tokens": 2000000, "supports_streaming": true}', 1.25, 5.00, false),
        
        -- Ollama Local Models
        ('Llama 3.1 8B (Local)', 'ollama', 'language', 'llama3.1:8b', '{"max_tokens": 128000, "supports_streaming": true}', 0, 0, true),
        ('Llama 3.1 70B (Local)', 'ollama', 'language', 'llama3.1:70b', '{"max_tokens": 128000, "supports_streaming": true}', 0, 0, true),
        ('Mistral 7B (Local)', 'ollama', 'language', 'mistral:7b', '{"max_tokens": 32000, "supports_streaming": true}', 0, 0, true),
        ('Qwen 2.5 7B (Local)', 'ollama', 'language', 'qwen2.5:7b', '{"max_tokens": 32000, "supports_streaming": true}', 0, 0, true),
        
        -- OpenAI Embedding Models
        ('text-embedding-3-small', 'openai', 'embedding', 'text-embedding-3-small', '{"dimensions": 1536}', 0.02, 0, false),
        ('text-embedding-3-large', 'openai', 'embedding', 'text-embedding-3-large', '{"dimensions": 3072}', 0.13, 0, false),
        
        -- Ollama Embedding Models
        ('nomic-embed-text (Local)', 'ollama', 'embedding', 'nomic-embed-text', '{"dimensions": 768}', 0, 0, true),
        ('mxbai-embed-large (Local)', 'ollama', 'embedding', 'mxbai-embed-large', '{"dimensions": 1024}', 0, 0, true),
        
        -- Groq Language Models
        ('Llama 3.1 70B (Groq)', 'groq', 'language', 'llama-3.1-70b-versatile', '{"max_tokens": 128000, "supports_streaming": true}', 0.59, 0.79, false),
        ('Mixtral 8x7B (Groq)', 'groq', 'language', 'mixtral-8x7b-32768', '{"max_tokens": 32768, "supports_streaming": true}', 0.24, 0.24, false),
        
        -- Together.ai Language Models
        ('Llama 3.1 405B (Together)', 'together', 'language', 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', '{"max_tokens": 130000, "supports_streaming": true}', 3.50, 3.50, false),
        
        -- Mistral Language Models
        ('Mistral Large', 'mistral', 'language', 'mistral-large-latest', '{"max_tokens": 128000, "supports_streaming": true}', 2.00, 6.00, false),
        ('Mistral Small', 'mistral', 'language', 'mistral-small-latest', '{"max_tokens": 32000, "supports_streaming": true}', 0.20, 0.60, false)
      ON CONFLICT (provider, model_id) DO NOTHING;
    `);
  },
  
  async down(db: MigrationDatabase): Promise<void> {
    await db.execute('DROP TABLE IF EXISTS default_models CASCADE;');
    await db.execute('DROP TABLE IF EXISTS models CASCADE;');
  },
};

export default migration003ModelsRegistry;
