import { kMeans, nearestCentroid, normalize } from './kmeans.js';
import { cosineSimilarity } from './similarity.js';
import type { SearchHit, VectorIndex } from './vector-index.js';

/** Rebuild lazily after writes. IVF trades training cost and recall for fewer scanned postings. */
export class IvfIndex<T> implements VectorIndex<T> {
  private readonly entries = new Map<string, { vector: Float32Array; payload: T }>();
  private centroids: Float32Array[] = [];
  private buckets: string[][] = [];
  private dirty = false;
  private dimensions?: number;
  constructor(readonly nlist = 8, readonly nprobe = 2, readonly seed = 42) {
    if (![nlist, nprobe].every(n => Number.isSafeInteger(n) && n > 0) || nprobe > nlist) throw new Error('Invalid IVF parameters');
  }
  add(id: string, vector: Float32Array, payload: T): void {
    const copy = normalize(vector);
    if (!id || (this.dimensions !== undefined && copy.length !== this.dimensions)) throw new Error('Invalid id or dimension');
    this.dimensions ??= copy.length;
    this.entries.set(id, { vector: copy, payload }); this.dirty = true;
  }
  build(): void {
    if (!this.dirty) return;
    const points = [...this.entries.values()].map(entry => entry.vector);
    const clusters = kMeans(points, Math.min(this.nlist, points.length), { seed: this.seed });
    this.centroids = clusters.centroids;
    this.buckets = this.centroids.map(() => []);
    [...this.entries.keys()].forEach((id, i) => this.buckets[clusters.assignments[i]].push(id));
    this.dirty = false;
  }
  size(): number { return this.entries.size; }
  search(query: Float32Array, k: number): SearchHit<T>[] {
    if (!Number.isSafeInteger(k) || k < 1) throw new Error('Invalid k');
    const vector = normalize(query);
    if (this.dimensions !== undefined && vector.length !== this.dimensions) throw new Error('Dimension mismatch');
    if (!this.size()) return [];
    this.build();
    const probes = this.centroids.map((c, i) => ({ i, score: cosineSimilarity(vector, c) }))
      .sort((a, b) => b.score - a.score || a.i - b.i).slice(0, this.nprobe);
    const hits: SearchHit<T>[] = [];
    for (const { i } of probes) for (const id of this.buckets[i]) {
      const entry = this.entries.get(id)!;
      hits.push({ id, payload: entry.payload, score: cosineSimilarity(vector, entry.vector) });
    }
    return hits.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, k);
  }
}
