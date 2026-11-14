import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEvaluationDataset } from '../dist/packages/evaluation/src/dataset.js';
import { recallAtK, reciprocalRankAtK, mean, percentile } from '../dist/packages/evaluation/src/metrics.js';
test('ranking metrics handle misses, duplicates, empty ground truth and cutoffs numerically', () => {
  assert.equal(recallAtK(['a', 'a', 'b'], ['a', 'b'], 2), 0.5);
  assert.equal(recallAtK(['x'], ['a'], 5), 0);
  assert.equal(recallAtK([], [], 5), null);
  assert.equal(reciprocalRankAtK(['x', 'a'], ['a'], 5), 0.5);
  assert.equal(reciprocalRankAtK(['x', 'a'], ['a'], 1), 0);
  assert.equal(mean([1, 2, 3]), 2); assert.equal(mean([]), null);
  assert.equal(percentile([4, 1, 3, 2], 0.5), 2);
  assert.equal(percentile([4, 1, 3, 2], 0.95), 4);
  assert.throws(() => mean([NaN])); assert.throws(() => recallAtK([], [], 0));
});
test('held-out fixed dataset resolves official evidence, source checksums and all query categories', async () => {
  const { dataset, corpus } = await loadEvaluationDataset();
  assert.equal(dataset.cases.length, 40);
  assert.equal(corpus.list().length, 10);
  assert.deepEqual(new Set(dataset.cases.map(c => c.category)), new Set(['retrieval', 'exact', 'context', 'abstention', 'temporal']));
  assert.ok(corpus.list().every(e => e.text.startsWith('Resumo editorial:') && e.provenance.checksum.length === 64));
});
