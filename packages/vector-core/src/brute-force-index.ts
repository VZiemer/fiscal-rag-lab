import { cosineSimilarity } from './similarity.js';
import type { SearchHit, VectorIndex } from './vector-index.js';

/** Exact O(N·d) baseline; keeps a defensive copy of each input vector. */
export class BruteForceIndex<T> implements VectorIndex<T> {
  private readonly vectors = new Map<string, { vector: Float32Array; payload: T }>();
  private dimensions: number | undefined;

  add(id: string, vector: Float32Array, payload: T): void {
    if (!id) throw new Error('A vector id is required');
    if (vector.length === 0) throw new RangeError('Empty vectors are invalid');
    if (this.dimensions !== undefined && vector.length !== this.dimensions) {
      throw new RangeError('Vector dimension mismatch');
    }
    for (const value of vector) if (!Number.isFinite(value)) throw new RangeError('Non-finite vector');
    if (vector.every(value => value === 0)) throw new RangeError('Zero vectors are invalid');
    this.dimensions ??= vector.length;
    this.vectors.set(id, { vector: new Float32Array(vector), payload });
  }

  search(query: Float32Array, k: number): SearchHit<T>[] {
    if (!Number.isSafeInteger(k) || k < 1) throw new RangeError('k must be a positive integer');
    if (this.dimensions === undefined) return [];
    if (query.length !== this.dimensions) throw new RangeError('Query dimension mismatch');
    const hits: SearchHit<T>[] = [];
    for (const [id, entry] of this.vectors.entries()) {
      hits.push({ id, payload: entry.payload, score: cosineSimilarity(query, entry.vector) });
    }
    return hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, k);
  }

  size(): number { return this.vectors.size; }
}
