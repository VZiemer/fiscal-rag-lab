import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Bm25Index, tokenize } from '../dist/packages/retrieval/src/bm25.js';
test('BM25 matches hand-calculated IDF, TF saturation and length normalization', () => {
  const index = new Bm25Index();
  index.add('a', 'fiscal fiscal lei', 'a'); index.add('b', 'lei', 'b');
  const expected = Math.log(1 + 1.5 / 1.5) * (2 * 2.2) / (2 + 1.2 * (0.25 + 0.75 * 3 / 2));
  assert.ok(Math.abs(index.search('fiscal', 2)[0].score - expected) < 1e-12);
  assert.deepEqual(index.search('fiscal fiscal', 2), index.search('fiscal', 2));
  assert.equal(index.search('lei', 2)[0].id, 'b');
});
test('BM25 updates postings and document lengths without stale terms', () => {
  const index = new Bm25Index(1.5, 0);
  index.add('a', 'foo', 1); index.add('b', 'bar', 2); index.add('a', 'bar', 3);
  assert.equal(index.size(), 2);
  assert.deepEqual(index.search('foo', 10), []);
  assert.deepEqual(index.search('bar', 10).map(r => r.id), ['a', 'b']);
  index.remove('a'); index.remove('b');
  assert.deepEqual(index.search('bar', 2), []);
  index.add('empty', '', 0);
  assert.deepEqual(index.search('', 1), []);
});
test('tokenization normalizes accents, preserves code tokens and validates controls', () => {
  assert.deepEqual(tokenize('Operação NF-e 5102'), ['operacao', 'nf', 'e', '5102']);
  assert.throws(() => new Bm25Index(0));
  assert.throws(() => new Bm25Index(1, 2));
  assert.throws(() => new Bm25Index().search('x', 0));
});
