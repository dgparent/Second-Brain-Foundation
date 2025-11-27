import { Pinecone } from '@pinecone-database/pinecone';
import { getTenantNamespace, getEntityVectorId } from './tenant-namespaces';
import { VectorRecord, QueryResult, VectorSearchParams } from './types';

export class PineconeVectorClient {
  private client: Pinecone;
  private indexName: string;

  constructor(apiKey: string, indexName: string = 'sbf-embeddings') {
    this.client = new Pinecone({ apiKey });
    this.indexName = indexName;
  }

  async upsert(tenantId: string, vectors: VectorRecord[]): Promise<void> {
    const index = this.client.index(this.indexName);
    const namespace = getTenantNamespace(tenantId);

    const records = vectors.map(v => ({
      id: v.id,
      values: v.values,
      metadata: { ...v.metadata, tenantId },
    }));

    await index.namespace(namespace).upsert(records);
  }

  async query(params: VectorSearchParams): Promise<QueryResult[]> {
    const { tenantId, embedding, topK = 10, filter } = params;
    const index = this.client.index(this.indexName);
    const namespace = getTenantNamespace(tenantId);

    const queryFilter = {
      ...filter,
      tenantId: { $eq: tenantId },
    };

    const response = await index.namespace(namespace).query({
      vector: embedding,
      topK,
      filter: queryFilter,
      includeMetadata: true,
    });

    return response.matches?.map(match => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata as any,
    })) || [];
  }

  async delete(tenantId: string, vectorIds: string[]): Promise<void> {
    const index = this.client.index(this.indexName);
    const namespace = getTenantNamespace(tenantId);

    await index.namespace(namespace).deleteMany(vectorIds);
  }

  async deleteAll(tenantId: string): Promise<void> {
    const index = this.client.index(this.indexName);
    const namespace = getTenantNamespace(tenantId);

    await index.namespace(namespace).deleteAll();
  }

  async createIndex(dimension: number = 1536): Promise<void> {
    await this.client.createIndex({
      name: this.indexName,
      dimension,
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
  }
}

let vectorClient: PineconeVectorClient | null = null;

export function getVectorClient(): PineconeVectorClient {
  if (!vectorClient) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is not set');
    }
    const indexName = process.env.PINECONE_INDEX_NAME || 'sbf-embeddings';
    vectorClient = new PineconeVectorClient(apiKey, indexName);
  }
  return vectorClient;
}
