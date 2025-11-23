// Deterministic dummy embedding generator (replace with real model later)
import crypto from 'crypto';

export function embed(text: string, dim = 32): number[] {
  const hash = crypto.createHash('sha256').update(text).digest();
  const vector: number[] = [];
  for (let i = 0; i < dim; i++) {
    vector.push(hash[i] / 255);
  }
  return vector;
}
