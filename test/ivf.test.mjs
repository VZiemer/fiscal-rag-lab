import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kMeans, normalize } from '../dist/packages/vector-core/src/kmeans.js';
import { IvfIndex } from '../dist/packages/vector-core/src/ivf-index.js';
import { BruteForceIndex } from '../dist/packages/vector-core/src/brute-force-index.js';
const v = a => new Float32Array(a);
test('spherical K-Means finds separated groups reproducibly and unit centroids', () => {
  const points = [[1, 0], [2, 0.1], [0, 1], [0.1, 2]].map(v);
  const a = kMeans(points, 2), b = kMeans(points, 2);
  assert.deepEqual(a, b);
  assert.equal(a.assignments[0], a.assignments[1]);
  assert.equal(a.assignments[2], a.assignments[3]);
  assert.notEqual(a.assignments[0], a.assignments[2]);
  for (const c of a.centroids) assert.ok(Math.abs(c.reduce((s, n) => s + n * n, 0) - 1) < 1e-6);
  const one = kMeans([v([1, 0]), v([0, 1])], 1);
  assert.ok(Math.abs(one.centroids[0][0] - Math.SQRT1_2) < 1e-6);
});
test('K-Means handles duplicate/antipodal points, iteration cap and invalid inputs', () => {
  const result = kMeans([v([1, 0]), v([1, 0]), v([-1, 0])], 3, { maxIterations: 1 });
  assert.ok(result.centroids.every(c => c.every(Number.isFinite)));
  assert.throws(() => kMeans([], 1));
  assert.throws(() => kMeans([v([0, 0])], 1));
  assert.throws(() => kMeans([v([1]), v([1, 0])], 1));
  assert.throws(() => normalize(v([Infinity])));
});
test('IVF all probes agrees with exact top-k and rebuilding handles updates', () => {
  const exact = new BruteForceIndex(), ivf = new IvfIndex(4, 4);
  for (let i = 0; i < 80; i++) {
    const point = v([Math.sin(i), Math.cos(i), Math.sin(2 * i)]);
    exact.add(String(i), point, i); ivf.add(String(i), point, i);
  }
  for (const query of [[1, 0, 0], [0, 1, 0], [1, -1, 2]].map(v))
    assert.deepEqual(ivf.search(query, 10).map(r => r.id), exact.search(query, 10).map(r => r.id));
  ivf.add('0', v([-1, 0, 0]), 'updated');
  assert.equal(ivf.search(v([-1, 0, 0]), 1)[0].payload, 'updated');
  assert.throws(() => ivf.search(v([1]), 1));
  assert.throws(() => new IvfIndex(2, 3));
  assert.deepEqual(new IvfIndex().search(v([1, 0]), 2), []);
});
