export function recallAtK(actual: readonly string[], relevant: readonly string[], k: number): number | null {
  if (!Number.isSafeInteger(k) || k < 1) throw new Error('Invalid k');
  const expected = new Set(relevant);
  if (!expected.size) return null;
  const found = new Set(actual.slice(0, k).filter(id => expected.has(id)));
  return found.size / expected.size;
}
export function reciprocalRankAtK(actual: readonly string[], relevant: readonly string[], k: number): number | null {
  if (!Number.isSafeInteger(k) || k < 1) throw new Error('Invalid k');
  if (!relevant.length) return null;
  const rank = actual.slice(0, k).findIndex(id => relevant.includes(id));
  return rank < 0 ? 0 : 1 / (rank + 1);
}
export function mean(values: readonly number[]): number | null {
  if (values.some(n => !Number.isFinite(n))) throw new Error('Non-finite metric');
  return values.length ? values.reduce((sum, n) => sum + n, 0) / values.length : null;
}
export function percentile(values: readonly number[], p: number): number | null {
  if (!Number.isFinite(p) || p <= 0 || p > 1 || values.some(n => !Number.isFinite(n))) throw new Error('Invalid percentile');
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * p) - 1];
}
