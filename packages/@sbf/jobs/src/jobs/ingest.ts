import { eventTrigger } from "@trigger.dev/sdk";
import { client } from "../index";
import { AiClientFactory } from "@sbf/ai-client";
import { getVectorClient } from "@sbf/vector-client";
import { config } from "@sbf/config";

// Simple text splitter helper
function splitText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
  if (!text) return [];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + chunkSize, text.length);
    
    // Try to break at a space if we are not at the end
    if (end < text.length) {
        const lastSpace = text.lastIndexOf(' ', end);
        if (lastSpace > start) {
            end = lastSpace;
        }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    // Prevent infinite loop if overlap >= chunk size or no progress
    if (start >= end) start = end; 
  }
  return chunks;
}

// Define the job
client.defineJob({
  id: "ingest-document",
  name: "Ingest Document",
  version: "1.1.0",
  trigger: eventTrigger({
    name: "document.ingest",
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Ingesting document...", { payload });

    const { documentId, text, tenantId, metadata } = payload as any;

    if (!text || !documentId || !tenantId) {
      throw new Error("Missing required payload fields: text, documentId, tenantId");
    }

    // 1. Initialize Clients
    const aiClient = AiClientFactory.create({
      provider: (config.ai.provider as any) || 'ollama',
      baseUrl: config.ai.baseUrl,
      apiKey: config.ai.apiKey
    });
    
    const vectorClient = getVectorClient();

    // 2. Chunk Text
    // Use configured chunk size or default to 2000 chars (approx 500 tokens)
    // Nomic supports 8192 tokens, so we have plenty of headroom.
    const chunkSize = (config.ai as any).ingestion?.chunkSize || 2000;
    const chunkOverlap = (config.ai as any).ingestion?.chunkOverlap || 200;
    
    const chunks = splitText(text, chunkSize, chunkOverlap);
    await io.logger.info(`Split document into ${chunks.length} chunks (size: ${chunkSize}).`);

    // 3. Process Chunks
    const vectors = [];
    
    // Process in batches to avoid overwhelming the embedding API
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkId = `${documentId}-chunk-${i}`;
        
        // Embed
        const embeddingResponse = await aiClient.embed({
            input: chunk,
            model: config.ai.embeddingModel || 'nomic-embed-text'
        });
        const embedding = embeddingResponse.embeddings[0];

        vectors.push({
            id: chunkId,
            values: embedding,
            metadata: {
                ...metadata,
                text: chunk, // Store the actual chunk text for RAG retrieval
                sourceDocumentId: documentId,
                chunkIndex: i,
                totalChunks: chunks.length,
                createdAt: new Date().toISOString(),
                entityType: 'document_chunk',
                tenantId
            }
        });
    }

    // 4. Store in Vector DB
    if (vectors.length > 0) {
        await io.logger.info(`Upserting ${vectors.length} vectors...`);
        await vectorClient.upsert(tenantId, vectors);
    }

    await io.logger.info("Ingestion complete.");

    return {
      status: "success",
      documentId: documentId,
      chunksProcessed: chunks.length
    };
  },
});
