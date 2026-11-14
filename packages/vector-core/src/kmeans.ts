import { cosineSimilarity } from './similarity.js';

export function normalize(vector: Float32Array): Float32Array {
  if (!vector.length || !vector.every(Number.isFinite)) throw new Error('Invalid vector');
  const norm = Math.sqrt(vector.reduce((sum, n) => sum + n * n, 0));
  if (!norm) throw new Error('Zero vector');
  return vector.map(n => n / norm);
}

export function seededRandom(seed: number): () => number {
  if (!Number.isSafeInteger(seed)) throw new Error('Invalid seed');
  let state = seed >>> 0;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}

export interface Clusters { centroids: Float32Array[]; assignments: number[]; iterations: number }
export function nearestCentroid(vector: Float32Array, centroids: readonly Float32Array[]): number {
  let best = -1, score = -Infinity;
  centroids.forEach((centroid, i) => {
    const candidate = cosineSimilarity(vector, centroid);
    if (candidate > score) { score = candidate; best = i; }
  });
  return best;
}

/** Spherical K-Means matches cosine search; normalized means avoid scale-biased partitions. */
export function kMeans(vectors: readonly Float32Array[], k: number, options: { seed?: number; maxIterations?: number } = {}): Clusters {
  if (!Number.isSafeInteger(k) || k < 1 || k > vectors.length) throw new Error('Invalid cluster count');
  const limit = options.maxIterations ?? 30;
  if (!Number.isSafeInteger(limit) || limit < 1) throw new Error('Invalid iteration limit');
  const points = vectors.map(normalize);
  const dimensions = points[0].length;
  if (points.some(v => v.length !== dimensions)) throw new Error('Dimension mismatch');
  const random = seededRandom(options.seed ?? 42);
  const selected = new Set<number>([Math.floor(random() * points.length)]);
  const centroids: Float32Array[] = [new Float32Array(points[[...selected][0]])];
  // K-Means++ sampling uses squared Euclidean distance on the unit sphere (2 - 2*cosine).
  while (centroids.length < k) {
    const distances = points.map((point, i) => selected.has(i) ? 0 : Math.max(0, 2 - 2 * Math.max(...centroids.map(c => cosineSimilarity(point, c)))));
    let remaining = random() * distances.reduce((sum, d) => sum + d, 0);
    let choice = -1;
    for (let i = 0; i < distances.length; i++) {
      remaining -= distances[i];
      if (distances[i] > 0 && remaining <= 0) { choice = i; break; }
    }
    if (choice < 0) choice = points.findIndex((_, i) => !selected.has(i));
    selected.add(choice);
    centroids.push(new Float32Array(points[choice]));
  }
  let assignments = points.map(() => -1), iterations = 0;
  for (; iterations < limit; iterations++) {
    const next = points.map(p => nearestCentroid(p, centroids));
    const changed = next.some((a, i) => a !== assignments[i]);
    assignments = next;
    if (!changed) break;
    const sums = centroids.map(() => new Float64Array(dimensions));
    const counts = centroids.map(() => 0);
    points.forEach((point, i) => { counts[assignments[i]]++; point.forEach((v, j) => { sums[assignments[i]][j] += v; }); });
    for (let i = 0; i < k; i++) {
      if (counts[i] && sums[i].some(v => v !== 0)) centroids[i] = normalize(new Float32Array(sums[i].map(v => v / counts[i])));
      // Identical or antipodal points can leave empty/zero-mean clusters; retain a finite prior center.
    }
  }
  // Recompute membership against final centers even when the iteration budget is exhausted.
  return { centroids, assignments: points.map(p => nearestCentroid(p, centroids)), iterations };
}
