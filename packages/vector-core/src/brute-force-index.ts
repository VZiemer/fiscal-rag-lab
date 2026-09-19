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

  serialize(model: string): string {
    if (!model.trim()) throw new Error('Embedding model required');
    return JSON.stringify({ version: 1, algorithm: 'exact-cosine', model, dimensions: this.dimensions ?? null,
      entries: [...this.vectors].map(([id, entry]) => ({ id, vector: Array.from(entry.vector), payload: entry.payload })) });
  }

  static deserialize<T>(json: string, model: string, validatePayload: (value: unknown) => T): BruteForceIndex<T> {
    const snapshot = JSON.parse(json);
    if (snapshot?.version !== 1 || snapshot.algorithm !== 'exact-cosine' || snapshot.model !== model ||
        !Array.isArray(snapshot.entries) || (snapshot.dimensions !== null &&
        (!Number.isSafeInteger(snapshot.dimensions) || snapshot.dimensions < 1))) throw new Error('Incompatible index snapshot');
    const result = new BruteForceIndex<T>();
    const seen = new Set<string>();
    for (const entry of snapshot.entries) {
      if (typeof entry?.id !== 'string' || seen.has(entry.id) || !Array.isArray(entry.vector) ||
        entry.vector.length !== snapshot.dimensions || entry.vector.some((n: unknown) => typeof n !== 'number' || !Number.isFinite(n))) {
        throw new Error('Corrupt index snapshot');
      }
      seen.add(entry.id);
      result.add(entry.id, new Float32Array(entry.vector), validatePayload(entry.payload));
    }
    if (!snapshot.entries.length && snapshot.dimensions !== null) throw new Error('Inconsistent empty snapshot');
    return result;
  }
}
