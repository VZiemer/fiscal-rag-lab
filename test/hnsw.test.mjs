import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HnswIndex } from '../dist/packages/vector-core/src/hnsw-index.js';
import { BruteForceIndex } from '../dist/packages/vector-core/src/brute-force-index.js';
import { seededRandom } from '../dist/packages/vector-core/src/kmeans.js';
const v = a => new Float32Array(a);
test('HNSW fixed-seed graph attains high recall against exact and respects degree bounds', () => {
  const exact = new BruteForceIndex(), graph = new HnswIndex(8, 64, 80, 42), copy = new HnswIndex(8, 64, 80, 42);
  const rng = seededRandom(7);
  for (let i = 0; i < 200; i++) {
    const vector = v(Array.from({ length: 8 }, () => rng() * 2 - 1));
    exact.add(String(i), vector, i); graph.add(String(i), vector, i); copy.add(String(i), vector, i);
  }
  let found = 0;
  for (let i = 0; i < 20; i++) {
    const query = v(Array.from({ length: 8 }, () => rng() * 2 - 1));
    const truth = new Set(exact.search(query, 10).map(h => h.id));
    const hits = graph.search(query, 10);
    found += hits.filter(h => truth.has(h.id)).length;
    assert.deepEqual(hits, copy.search(query, 10));
    assert.equal(new Set(hits.map(h => h.id)).size, 10);
  }
  assert.ok(found / 200 >= 0.95, `recall=${found / 200}`);
  assert.ok(graph.diagnostics().levels > 1);
  assert.ok(graph.diagnostics().maxDegree <= 16);
});
test('HNSW handles copies, duplicate vectors, small/empty graphs and malformed inputs', () => {
  const index = new HnswIndex(2, 4, 8);
  assert.deepEqual(index.search(v([1, 0]), 1), []);
  const vector = v([1, 0]); index.add('a', vector, 'a'); vector[0] = -1;
  index.add('b', v([1, 0]), 'b'); index.add('c', v([-1, 0]), 'c');
  assert.deepEqual(index.search(v([1, 0]), 10).map(h => h.id), ['a', 'b', 'c']);
  assert.throws(() => index.add('a', v([1, 0]), null));
  assert.throws(() => index.search(v([0, 0]), 1));
  assert.throws(() => index.add('bad', v([1]), null));
  assert.throws(() => new HnswIndex(1));
});
