import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BruteForceIndex } from '../dist/packages/vector-core/src/brute-force-index.js';
const validate = value => { if (typeof value !== 'string') throw new Error('Invalid payload'); return value; };
test('exact index snapshot roundtrips vectors, payloads, ranking and model identity', () => {
  const index = new BruteForceIndex();
  index.add('a', new Float32Array([1, 2]), 'article-a');
  index.add('b', new Float32Array([-1, 2]), 'article-b');
  const restored = BruteForceIndex.deserialize(index.serialize('model@digest'), 'model@digest', validate);
  assert.equal(restored.size(), 2);
  assert.deepEqual(restored.search(new Float32Array([2, 1]), 5), index.search(new Float32Array([2, 1]), 5));
  assert.equal(BruteForceIndex.deserialize(new BruteForceIndex().serialize('x'), 'x', validate).size(), 0);
  assert.throws(() => BruteForceIndex.deserialize(index.serialize('a'), 'b', validate));
});
test('corrupt snapshot versions, duplicate ids, dimensions, values and payloads fail', () => {
  const index = new BruteForceIndex(); index.add('a', new Float32Array([1, 0]), 'ok');
  const snapshot = JSON.parse(index.serialize('x'));
  const mutations = [s => s.version = 9, s => s.entries.push(s.entries[0]), s => s.dimensions = 3,
    s => s.entries[0].vector[0] = null, s => s.entries[0].vector = [0, 0], s => s.entries[0].payload = 3];
  for (const mutate of mutations) {
    const s = structuredClone(snapshot); mutate(s);
    assert.throws(() => BruteForceIndex.deserialize(JSON.stringify(s), 'x', validate));
  }
});
