import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { downloadSnapshot, FileSnapshotStore, sha256 } from '../dist/apps/ingestion-worker/src/snapshots.js';
import { temporalStatus } from '../dist/packages/corpus/src/evidence.js';

export const source = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'synthetic test', jurisdiction: 'BR', edition: 'test', publishedAt: null, validFrom: null, validTo: null };
test('snapshots retain bytes, checksum, observations and provenance idempotently', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fiscal-snapshot-'));
  try {
    const store = new FileSnapshotStore(root);
    const options = { fetch: async () => new Response('synthetic', { headers: { 'content-type': 'text/plain' } }), now: () => new Date('2026-11-14T12:00:00Z') };
    const first = await downloadSnapshot(source, store, options);
    await downloadSnapshot(source, store, options);
    assert.equal(first.checksum, sha256('synthetic'));
    assert.deepEqual(await store.list('synthetic'), [first]);
    await downloadSnapshot(source, store, { ...options, now: () => new Date('2026-11-15T12:00:00Z') });
    assert.equal((await store.list('synthetic')).length, 2);
  } finally { await rm(root, { recursive: true, force: true }); }
});
test('download rejects untrusted URLs, status, limits and checksum mismatch before persistence', async () => {
  const store = { save: () => { throw new Error('must not save'); } };
  for (const sourceUrl of ['http://www.gov.br/x', 'https://example.com', 'https://gov.br.evil.com', 'https://user@www.gov.br']) {
    await assert.rejects(downloadSnapshot({ ...source, sourceUrl }, store));
  }
  await assert.rejects(downloadSnapshot(source, store, { fetch: async () => new Response('x', { status: 500 }) }), /HTTP 500/);
  await assert.rejects(downloadSnapshot(source, store, { fetch: async () => new Response('abcd'), maxBytes: 2 }), /too large/);
  await assert.rejects(downloadSnapshot(source, store, { fetch: async () => new Response('abc'), expectedChecksum: 'bad' }), /Checksum/);
  await assert.rejects(downloadSnapshot({ ...source, sourceId: '../bad' }, store), /Unsafe/);
});
test('unknown validity is explicit and invalid calendar dates fail', () => {
  assert.equal(temporalStatus(source, '2026-11-14'), 'unknown');
  assert.equal(temporalStatus({ validFrom: '2020-01-01', validTo: '2021-01-01' }, '2026-01-01'), 'outside-validity');
  assert.throws(() => temporalStatus(source, '2026-02-30'));
});
