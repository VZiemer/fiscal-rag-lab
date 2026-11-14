import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { FileSnapshotStore, sha256 } from '../dist/apps/ingestion-worker/src/snapshots.js';
import { buildCorpus, writeCorpusAtomically } from '../dist/apps/ingestion-worker/src/build-corpus.js';
import { loadServices } from '../dist/apps/mcp-server/src/runtime.js';
test('verified snapshot to legal corpus to runtime search preserves source relationships and rejects tampering', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fiscal-pipeline-'));
  try {
    const bytes = Buffer.from('Art. 1º Regra sintética sobre remessa.\nSalvo condição fictícia de exceção.');
    const snapshot = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'SYNTHETIC TEST', jurisdiction: 'BR',
      edition: 'test-v1', fetchedAt: '2026-11-14T12:00:00Z', publishedAt: null, validFrom: null, validTo: null,
      checksum: sha256(bytes), bytes: bytes.length, contentType: 'text/plain' };
    await new FileSnapshotStore(root).save(snapshot, bytes);
    const metadataFile = (await readdir(join(root, 'synthetic'))).find(name => name.endsWith('.json'));
    const manifest = { version: 1, snapshots: [{ metadataFile: join('synthetic', metadataFile), format: 'legal-text', documentId: 'test' }] };
    const corpus = await buildCorpus(manifest, root);
    const output = join(root, 'corpus.json'); await writeCorpusAtomically(output, corpus);
    const services = await loadServices(output);
    const result = await services.retriever.search({ query: 'remessa', mode: 'lexical', date: '2026-11-14' });
    assert.equal(result.evidence[0].provenance.checksum, snapshot.checksum);
    assert.equal(result.evidence[0].temporalStatus, 'unknown');
    assert.equal(result.evidence[0].relatedEvidence.length, 1);
    await writeFile(join(root, 'synthetic', `${snapshot.checksum}.bin`), 'tampered');
    await assert.rejects(buildCorpus(manifest, root), /integrity/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
