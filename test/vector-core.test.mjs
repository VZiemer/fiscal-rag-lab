import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cosineSimilarity } from '../dist/vector-core/src/similarity.js';
import { BruteForceIndex } from '../dist/vector-core/src/brute-force-index.js';

test('cosine similarity is 1 for collinear vectors', () => {
  assert.ok(Math.abs(cosineSimilarity(new Float32Array([1, 2]), new Float32Array([2, 4])) - 1) < 1e-6);
});

test('cosine similarity is 0 for orthogonal vectors', () => {
  assert.equal(cosineSimilarity(new Float32Array([1, 0]), new Float32Array([0, 1])), 0);
});

test('search returns exact top-k ordered by cosine score', () => {
  const index = new BruteForceIndex();
  index.add('a', new Float32Array([1, 0]), { cfop: '5102' });
  index.add('b', new Float32Array([0, 1]), { cfop: '6102' });
  index.add('c', new Float32Array([-1, 0]), { cfop: '0000' });
  const result = index.search(new Float32Array([1, 0]), 2);
  assert.deepEqual(result.map(r => r.id), ['a', 'b']);
  assert.equal(result[0].payload.cfop, '5102');
});

test('index defends against mutation of caller vector', () => {
  const index = new BruteForceIndex();
  const vector = new Float32Array([1, 0]);
  index.add('x', vector, 123);
  vector[0] = 0;
  assert.equal(index.search(new Float32Array([1, 0]), 1)[0].score, 1);
});

test('index validates dimensions and zero vectors', () => {
  const index = new BruteForceIndex();
  assert.throws(() => index.add('bad', new Float32Array([0, 0]), null));
  index.add('ok', new Float32Array([1, 0]), null);
  assert.throws(() => index.add('bad', new Float32Array([1]), null));
  assert.throws(() => index.search(new Float32Array([1]), 1));
});
