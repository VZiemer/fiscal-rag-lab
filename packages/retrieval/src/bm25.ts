import type { SearchHit } from '../../vector-core/src/vector-index.js';

export function tokenize(text: string): string[] {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

export class Bm25Index<T> {
  private readonly documents = new Map<string, { length: number; terms: Set<string>; payload: T }>();
  private readonly postings = new Map<string, Map<string, number>>();
  private totalLength = 0;
  constructor(readonly k1 = 1.2, readonly b = 0.75) {
    if (!Number.isFinite(k1) || k1 <= 0 || !Number.isFinite(b) || b < 0 || b > 1) throw new Error('Invalid BM25 parameters');
  }
  add(id: string, text: string, payload: T): void {
    if (!id) throw new Error('Document id required');
    this.remove(id);
    const tokens = tokenize(text);
    const frequencies = new Map<string, number>();
    for (const term of tokens) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
    for (const [term, frequency] of frequencies) {
      const posting = this.postings.get(term) ?? new Map<string, number>();
      posting.set(id, frequency);
      this.postings.set(term, posting);
    }
    this.documents.set(id, { length: tokens.length, terms: new Set(frequencies.keys()), payload });
    this.totalLength += tokens.length;
  }
  remove(id: string): void {
    const document = this.documents.get(id);
    if (!document) return;
    this.totalLength -= document.length;
    for (const term of document.terms) {
      const posting = this.postings.get(term)!;
      posting.delete(id);
      if (!posting.size) this.postings.delete(term);
    }
    this.documents.delete(id);
  }
  size(): number { return this.documents.size; }
  search(query: string, k: number): SearchHit<T>[] {
    if (!Number.isSafeInteger(k) || k < 1) throw new Error('k must be a positive integer');
    if (!this.totalLength) return [];
    const scores = new Map<string, number>();
    const n = this.size(), averageLength = this.totalLength / n;
    // Query terms are sets: repetition cannot inflate rank, and only matching postings are scanned.
    for (const term of new Set(tokenize(query))) {
      const posting = this.postings.get(term);
      if (!posting) continue;
      const idf = Math.log(1 + (n - posting.size + 0.5) / (posting.size + 0.5));
      for (const [id, tf] of posting) {
        const length = this.documents.get(id)!.length;
        const score = idf * tf * (this.k1 + 1) / (tf + this.k1 * (1 - this.b + this.b * length / averageLength));
        scores.set(id, (scores.get(id) ?? 0) + score);
      }
    }
    return [...scores].map(([id, score]) => ({ id, score, payload: this.documents.get(id)!.payload }))
      .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, k);
  }
}
