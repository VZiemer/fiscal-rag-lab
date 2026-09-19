import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OllamaEmbeddingProvider } from '../dist/packages/adapters/src/ollama-embedding.js';
import { HashEmbeddingProvider } from '../dist/packages/adapters/src/hash-embedding.js';
test('Ollama adapter sends model/batch without truncation and validates shape', async () => {
  const provider = new OllamaEmbeddingProvider('pinned-model', 2, undefined, async (url, options) => {
    assert.equal(url.pathname, '/api/embed');
    assert.deepEqual(JSON.parse(options.body), { model: 'pinned-model', input: ['one', 'two'], truncate: false });
    return Response.json({ embeddings: [[1, 0], [0, 2]] });
  });
  assert.deepEqual(await provider.embed(['one', 'two']), [new Float32Array([1, 0]), new Float32Array([0, 2])]);
  for (const embeddings of [[[0, 0]], [[1]], [], [[1, null]]]) {
    const bad = new OllamaEmbeddingProvider('test', 2, undefined, async () => Response.json({ embeddings }));
    await assert.rejects(bad.embed(['x']));
  }
  assert.throws(() => new OllamaEmbeddingProvider('x', 2, 'http://remote.example'));
});
test('hash control is deterministic, accent-insensitive, finite and normalized', async () => {
  const provider = new HashEmbeddingProvider(32);
  const [a, b] = await provider.embed(['Operação fiscal operação', 'operacao fiscal operacao']);
  assert.deepEqual(a, b);
  assert.ok(Math.abs(a.reduce((s, n) => s + n * n, 0) - 1) < 1e-6);
  await assert.rejects(provider.embed(['!!!']));
});
