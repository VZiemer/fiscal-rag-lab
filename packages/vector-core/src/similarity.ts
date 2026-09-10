/** Compute cosine similarity of two dense vectors without external vector libraries. */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length === 0 || a.length !== b.length) {
    throw new RangeError('Both vectors must have the same non-zero dimension');
  }

  let dot = 0;
  let aa = 0;
  let bb = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) {
      throw new RangeError('Vector values must be finite');
    }
    dot += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  const denominator = Math.sqrt(aa) * Math.sqrt(bb);
  if (denominator === 0) throw new RangeError('Zero vectors are not supported');
  return dot / denominator;
}
