export interface VectorRecord {
  id: string;
  vector: number[];
  aei_code: string;
  memory_level: string;
  security_level: number;
  vault_path: string;
}

export interface SimilarityResult extends VectorRecord {
  score: number;
}

export interface IVectorIndex {
  upsert(records: VectorRecord[]): void;
  query(vector: number[], topK: number, filter?: Partial<Pick<VectorRecord,'memory_level'|'security_level'>>): SimilarityResult[];
}

export class InMemoryVectorIndex implements IVectorIndex {
  private store: VectorRecord[] = [];

  upsert(records: VectorRecord[]): void {
    const replace = new Map(records.map(r => [r.id, r]));
    this.store = this.store.filter(r => !replace.has(r.id)).concat(records);
  }

  query(vector: number[], topK: number, filter?: Partial<Pick<VectorRecord,'memory_level'|'security_level'>>): SimilarityResult[] {
    const filtered = this.store.filter(r => {
      if (filter?.memory_level && r.memory_level !== filter.memory_level) return false;
      if (filter?.security_level !== undefined && r.security_level > (filter.security_level as number)) return false; // upper bound enforcement
      return true;
    });
    const scored = filtered.map(r => ({ ...r, score: cosine(vector, r.vector) }));
    scored.sort((a,b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

function cosine(a: number[], b: number[]): number {
  const dot = a.reduce((acc, v, i) => acc + v * (b[i] || 0), 0);
  const na = Math.sqrt(a.reduce((acc,v)=>acc+v*v,0));
  const nb = Math.sqrt(b.reduce((acc,v)=>acc+v*v,0));
  return na && nb ? dot / (na * nb) : 0;
}
