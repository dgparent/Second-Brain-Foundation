export interface VectorMetadata {
  tenantId: string;
  entityId: string;
  entityType: string;
  text: string;
  createdAt: string;
  [key: string]: any;
}

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: VectorMetadata;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata: VectorMetadata;
}

export interface VectorSearchParams {
  tenantId: string;
  embedding: number[];
  topK?: number;
  filter?: Record<string, any>;
}
