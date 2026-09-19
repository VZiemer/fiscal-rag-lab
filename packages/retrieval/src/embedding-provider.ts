export interface EmbeddingProvider {
  readonly model: string;
  readonly dimensions: number;
  embed(texts: readonly string[]): Promise<Float32Array[]>;
}

export function validateEmbeddings(vectors: readonly Float32Array[], expectedCount: number, dimensions: number): void {
  if (vectors.length !== expectedCount) throw new Error('Embedding count mismatch');
  for (const vector of vectors) {
    if (vector.length !== dimensions || !vector.every(Number.isFinite) || vector.every(n => n === 0)) {
      throw new Error('Invalid embedding vector');
    }
  }
}
