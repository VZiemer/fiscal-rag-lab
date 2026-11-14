import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chunkLegalDocument } from '../dist/packages/retrieval/src/legal-chunker.js';
const provenance = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'TEST ONLY', jurisdiction: 'BR', edition: 'v1', publishedAt: null, validFrom: null, validTo: null, fetchedAt: '2026-11-14T12:00:00Z', checksum: 'a'.repeat(64) };
test('legal chunker retains articles, paragraphs, exceptions, provenance and stable ids', () => {
  const document = { id: 'fixture', provenance, text: 'Preâmbulo sintético.\nArt. 1º Regra sintética.\n§ 1º Condição sintética.\nExceto na hipótese fictícia.\nArt. 2º Outra regra.' };
  const chunks = chunkLegalDocument(document);
  assert.equal(chunks.length, 5);
  assert.equal(chunks[2].parentId, chunks[1].id);
  assert.equal(chunks[3].article, '1º');
  assert.ok(chunks[1].relatedIds.includes(chunks[3].id));
  assert.ok(chunks[3].relatedIds.includes(chunks[1].id));
  assert.equal(chunks[4].parentId, null);
  assert.deepEqual(chunkLegalDocument(document), chunks);
  assert.deepEqual(chunks[0].provenance, provenance);
});
test('oversized legal units retain reconstruction links and bounded pieces', () => {
  const document = { id: 'long', provenance, text: `Art. 1º ${'regra '.repeat(40)}\nSalvo ${'exceção '.repeat(30)}` };
  const chunks = chunkLegalDocument(document, 80);
  assert.ok(chunks.every(c => c.text.length <= 80));
  const ids = new Set(chunks.map(c => c.id));
  for (const c of chunks) for (const id of c.relatedIds) assert.ok(ids.has(id));
  assert.ok(chunks.at(-1).parentId);
  assert.throws(() => chunkLegalDocument(document, 0));
  assert.throws(() => chunkLegalDocument({ ...document, text: '' }));
});
