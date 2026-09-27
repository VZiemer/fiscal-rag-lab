import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reciprocalRankFusion, routeQuery, HybridRetriever } from '../dist/packages/retrieval/src/hybrid.js';
import { MemoryCorpus } from '../dist/packages/corpus/src/memory-corpus.js';
import { InMemoryFiscalRepository } from '../dist/packages/fiscal-domain/src/code-repository.js';
import { HashEmbeddingProvider } from '../dist/packages/adapters/src/hash-embedding.js';
import { BruteForceIndex } from '../dist/packages/vector-core/src/brute-force-index.js';
const provenance = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'TEST ONLY', jurisdiction: 'SP', edition: 'v1', publishedAt: null, validFrom: '2020-01-01', validTo: '2026-12-31', fetchedAt: '2026-11-14T12:00:00Z', checksum: 'a'.repeat(64) };
const make = (id, text, overrides = {}) => ({ id, documentId: 'fixture', text, article: '1', parentId: null, relatedIds: [], provenance: { ...provenance }, ...overrides });
test('RRF uses ranks instead of incompatible scores, deduplicates and matches formula', () => {
  const hit = (id, score) => ({ id, score, payload: id });
  const result = reciprocalRankFusion([[hit('a', 999), hit('b', 1), hit('a', 999)], [hit('b', 0.1), hit('c', 0.09)]], 3);
  assert.equal(result[0].id, 'b');
  assert.ok(Math.abs(result[0].score - (1 / 62 + 1 / 61)) < 1e-12);
  assert.equal(result.find(h => h.id === 'a').score, 1 / 61);
  assert.throws(() => reciprocalRankFusion([], 0));
});
test('query routing recognizes only complete exact identifiers', () => {
  assert.deepEqual(routeQuery('CFOP 5.102'), { kind: 'cfop', code: '5.102' });
  assert.equal(routeQuery('NCM 1234.56.78').kind, 'ncm');
  assert.equal(routeQuery('quero CFOP 5102 para venda').kind, 'search');
  assert.equal(routeQuery('510').kind, 'search');
});
test('hybrid filters obsolete/jurisdiction evidence before cutoff and expands legal exceptions', async () => {
  const entries = [make('a', 'regra sintética devolução', { relatedIds: ['b'] }), make('b', 'salvo condição especial', { parentId: 'a' }),
    make('old', 'devolução devolução', { provenance: { ...provenance, validTo: '2021-01-01' } }),
    make('other', 'devolução', { provenance: { ...provenance, jurisdiction: 'RJ' } })];
  const codes = new InMemoryFiscalRepository([{ kind: 'cfop', code: '5102', description: 'Synthetic code', notes: null, provenance }]);
  const retriever = await HybridRetriever.create(new MemoryCorpus(entries), codes, new HashEmbeddingProvider(128), new BruteForceIndex());
  for (const mode of ['lexical', 'vector', 'hybrid']) {
    const result = await retriever.search({ query: 'devolução', date: '2026-11-14', jurisdiction: 'SP', topK: 1, mode });
    assert.equal(result.evidence[0].id, 'a');
    assert.equal(result.evidence[0].temporalStatus, 'valid');
    assert.deepEqual(result.evidence[0].relatedEvidence.map(e => e.id), ['b']);
    assert.equal(result.evidence[0].provenance.sourceUrl, provenance.sourceUrl);
  }
  assert.equal((await retriever.search({ query: 'CFOP 5102', date: '2026-11-14' })).lookup.records[0].code, '5102');
  assert.equal((await retriever.search({ query: 'absentunknownterm', mode: 'lexical' })).evidence.length, 0);
  await assert.rejects(retriever.search({ query: 'x', date: '2026-02-30' }));
  assert.throws(() => new MemoryCorpus([entries[0]]), /relationship/);
});
