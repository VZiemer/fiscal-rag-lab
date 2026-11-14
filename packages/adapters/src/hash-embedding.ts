import type { EmbeddingProvider } from '../../retrieval/src/embedding-provider.js';

/** Lexical feature hashing is an offline control, not a semantic or learned embedding model. */
export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly model = 'lexical-fnv1a-v1';
  constructor(readonly dimensions = 128) {
    if (!Number.isSafeInteger(dimensions) || dimensions < 2) throw new Error('Invalid dimensions');
  }
  async embed(texts: readonly string[]): Promise<Float32Array[]> {
    return texts.map(text => {
      const tokens = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[\p{L}\p{N}]+/gu);
      if (!tokens) throw new Error('No tokens to embed');
      const vector = new Float32Array(this.dimensions);
      for (const token of tokens) {
        let hash = 2166136261;
        for (const char of token) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619) >>> 0;
        vector[hash % this.dimensions] += 1;
      }
      const norm = Math.sqrt(vector.reduce((sum, n) => sum + n * n, 0));
      return vector.map(n => n / norm);
    });
  }
}
