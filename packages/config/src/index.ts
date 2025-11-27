import 'dotenv/config';

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  vector: {
    apiKey: process.env.PINECONE_API_KEY || '',
    indexName: process.env.PINECONE_INDEX_NAME || 'sbf-embeddings',
  },
  ai: {
    togetherApiKey: process.env.TOGETHER_API_KEY || '',
    provider: process.env.AI_PROVIDER || 'ollama',
    apiKey: process.env.AI_API_KEY || '',
    baseUrl: process.env.AI_BASE_URL || 'http://localhost:11434',
    embeddingModel: process.env.AI_EMBEDDING_MODEL || 'nomic-embed-text',
    chatModel: process.env.AI_CHAT_MODEL || 'llama3',
    ingestion: {
      chunkSize: parseInt(process.env.AI_INGESTION_CHUNK_SIZE || '2000', 10),
      chunkOverlap: parseInt(process.env.AI_INGESTION_CHUNK_OVERLAP || '200', 10),
    }
  },
};

export default config;
