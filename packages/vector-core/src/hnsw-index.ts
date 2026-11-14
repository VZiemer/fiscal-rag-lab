import { normalize, seededRandom } from './kmeans.js';
import { cosineSimilarity } from './similarity.js';
import type { SearchHit, VectorIndex } from './vector-index.js';

interface Node<T> { vector: Float32Array; payload: T; links: Set<string>[] }
interface Candidate { id: string; score: number }
const order = (a: Candidate, b: Candidate): number => b.score - a.score || a.id.localeCompare(b.id);

/** Hierarchical navigable small-world graph, built from cosine distances without search libraries. */
export class HnswIndex<T> implements VectorIndex<T> {
  private readonly nodes = new Map<string, Node<T>>();
  private readonly random: () => number;
  private entry?: string;
  private dimensions?: number;
  private maxLevel = -1;
  constructor(readonly m = 12, readonly efConstruction = 100, readonly efSearch = 64, seed = 42) {
    if (![m, efConstruction, efSearch].every(n => Number.isSafeInteger(n) && n > 0) || m < 2 || efConstruction < m) throw new Error('Invalid HNSW parameters');
    this.random = seededRandom(seed);
  }
  private score(query: Float32Array, id: string): Candidate {
    return { id, score: cosineSimilarity(query, this.nodes.get(id)!.vector) };
  }
  private greedy(query: Float32Array, entry: string, layer: number): string {
    let best = this.score(query, entry);
    while (true) {
      const previous = best.id;
      for (const id of this.nodes.get(best.id)!.links[layer] ?? []) {
        const candidate = this.score(query, id);
        if (order(candidate, best) < 0) best = candidate;
      }
      if (best.id === previous) return best.id;
    }
  }
  private searchLayer(query: Float32Array, entries: string[], ef: number, layer: number): Candidate[] {
    const visited = new Set(entries);
    const candidates = entries.map(id => this.score(query, id)).sort(order);
    const best = [...candidates];
    while (candidates.length) {
      const current = candidates.shift()!;
      if (best.length >= ef && order(current, best[best.length - 1]) > 0) break;
      for (const id of this.nodes.get(current.id)!.links[layer] ?? []) {
        if (visited.has(id)) continue;
        visited.add(id);
        const candidate = this.score(query, id);
        if (best.length < ef || order(candidate, best[best.length - 1]) < 0) {
          candidates.push(candidate); candidates.sort(order);
          best.push(candidate); best.sort(order);
          if (best.length > ef) best.pop();
        }
      }
    }
    // Sorted arrays keep this reference readable; heaps reduce O(ef log ef) queue work at scale.
    return best;
  }
  private select(candidates: Candidate[], limit: number): string[] {
    const selected: Candidate[] = [], deferred: Candidate[] = [];
    for (const candidate of candidates.sort(order)) {
      const point = this.nodes.get(candidate.id)!.vector;
      // Prefer links in different directions, then fill spare slots to retain connectivity.
      if (selected.every(other => cosineSimilarity(point, this.nodes.get(other.id)!.vector) <= candidate.score)) selected.push(candidate);
      else deferred.push(candidate);
      if (selected.length === limit) break;
    }
    return [...selected, ...deferred].slice(0, limit).map(c => c.id);
  }
  add(id: string, vector: Float32Array, payload: T): void {
    const copy = normalize(vector);
    if (!id || this.nodes.has(id)) throw new Error('HNSW requires a unique non-empty id; rebuild for updates');
    if (this.dimensions !== undefined && copy.length !== this.dimensions) throw new Error('Dimension mismatch');
    this.dimensions ??= copy.length;
    const level = Math.min(32, Math.floor(-Math.log(Math.max(Number.MIN_VALUE, 1 - this.random())) / Math.log(this.m)));
    const node: Node<T> = { vector: copy, payload, links: Array.from({ length: level + 1 }, () => new Set()) };
    this.nodes.set(id, node);
    if (!this.entry) { this.entry = id; this.maxLevel = level; return; }
    let ep = this.entry;
    for (let layer = this.maxLevel; layer > level; layer--) ep = this.greedy(copy, ep, layer);
    for (let layer = Math.min(level, this.maxLevel); layer >= 0; layer--) {
      const candidates = this.searchLayer(copy, [ep], this.efConstruction, layer);
      const neighbors = this.select(candidates.filter(c => c.id !== id), this.m);
      for (const neighborId of neighbors) {
        node.links[layer].add(neighborId);
        const neighbor = this.nodes.get(neighborId)!;
        neighbor.links[layer].add(id);
        const cap = layer === 0 ? this.m * 2 : this.m;
        if (neighbor.links[layer].size > cap) {
          neighbor.links[layer] = new Set(this.select([...neighbor.links[layer]].map(other => this.score(neighbor.vector, other)), cap));
        }
      }
      if (candidates.length) ep = candidates[0].id;
    }
    if (level > this.maxLevel) { this.entry = id; this.maxLevel = level; }
  }
  size(): number { return this.nodes.size; }
  search(query: Float32Array, k: number): SearchHit<T>[] {
    if (!Number.isSafeInteger(k) || k < 1) throw new Error('Invalid k');
    const vector = normalize(query);
    if (this.dimensions !== undefined && vector.length !== this.dimensions) throw new Error('Dimension mismatch');
    if (!this.entry) return [];
    let ep = this.entry;
    for (let layer = this.maxLevel; layer > 0; layer--) ep = this.greedy(vector, ep, layer);
    return this.searchLayer(vector, [ep], Math.max(k, this.efSearch), 0).slice(0, k)
      .map(hit => ({ ...hit, payload: this.nodes.get(hit.id)!.payload }));
  }
  diagnostics(): { nodes: number; levels: number; edges: number; maxDegree: number; representationBytes: number } {
    let edges = 0, maxDegree = 0;
    for (const node of this.nodes.values()) for (const links of node.links) {
      edges += links.size; maxDegree = Math.max(maxDegree, links.size);
    }
    // Representation size is diagnostic JSON, not a supported restorable snapshot format.
    const representationBytes = new TextEncoder().encode(JSON.stringify([...this.nodes].map(([id, n]) =>
      ({ id, vector: [...n.vector], payload: n.payload, links: n.links.map(l => [...l]) })))).length;
    return { nodes: this.size(), levels: this.maxLevel + 1, edges, maxDegree, representationBytes };
  }
}
