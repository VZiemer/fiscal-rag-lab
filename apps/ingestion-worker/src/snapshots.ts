import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { assertProvenance, type Provenance } from '../../../packages/corpus/src/evidence.js';

export interface Snapshot extends Provenance { bytes: number; contentType: string }
export type SourceInput = Omit<Provenance, 'fetchedAt' | 'checksum'>;
export interface SnapshotStore {
  save(snapshot: Snapshot, bytes: Uint8Array): Promise<void>;
}
export const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex');
const sourcePath = (id: string): string => {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new Error('Unsafe source id');
  return id;
};

/** Content addressing keeps raw bytes immutable; each observation retains its own metadata. */
export class FileSnapshotStore implements SnapshotStore {
  constructor(private readonly root: string) {}
  async save(snapshot: Snapshot, bytes: Uint8Array): Promise<void> {
    assertProvenance(snapshot);
    if (bytes.length !== snapshot.bytes || sha256(bytes) !== snapshot.checksum) throw new Error('Checksum mismatch');
    const directory = join(this.root, sourcePath(snapshot.sourceId));
    await mkdir(directory, { recursive: true });
    const rawPath = join(directory, `${snapshot.checksum}.bin`);
    // Exclusive creation avoids replacing an existing snapshot during concurrent ingestion.
    try { await writeFile(rawPath, bytes, { flag: 'wx' }); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      if (sha256(await readFile(rawPath)) !== snapshot.checksum) throw new Error('Stored snapshot is corrupt');
    }
    const json = JSON.stringify(snapshot, null, 2);
    try { await writeFile(join(directory, `${snapshot.checksum}-${sha256(json)}.json`), json, { flag: 'wx' }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
  }
  async list(id: string): Promise<Snapshot[]> {
    const directory = join(this.root, sourcePath(id));
    let names: string[];
    try { names = await readdir(directory); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
    return Promise.all(names.filter(n => n.endsWith('.json')).sort().map(async name => {
      const metadata: Snapshot = JSON.parse(await readFile(join(directory, name), 'utf8'));
      assertProvenance(metadata);
      const bytes = await readFile(join(directory, `${metadata.checksum}.bin`));
      if (bytes.length !== metadata.bytes || sha256(bytes) !== metadata.checksum) throw new Error('Corrupt snapshot');
      return metadata;
    }));
  }
}

export async function downloadSnapshot(source: SourceInput, store: SnapshotStore, options: {
  fetch?: typeof fetch; now?: () => Date; maxBytes?: number; expectedChecksum?: string;
} = {}): Promise<Snapshot> {
  sourcePath(source.sourceId);
  assertProvenance({ ...source, checksum: '0'.repeat(64), fetchedAt: new Date().toISOString() });
  const maxBytes = options.maxBytes ?? 20 * 1024 * 1024;
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) throw new Error('Invalid byte limit');
  const response = await (options.fetch ?? fetch)(source.sourceUrl, {
    signal: AbortSignal.timeout(30_000), redirect: 'error', headers: { 'User-Agent': 'fiscal-rag-lab/0.1' }
  });
  if (!response.ok || !response.body) throw new Error(`Download failed: HTTP ${response.status}`);
  if (Number(response.headers.get('content-length')) > maxBytes) { await response.body.cancel(); throw new Error('Source too large'); }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) throw new Error('Source too large');
      chunks.push(value);
    }
  } catch (error) { await reader.cancel(); throw error; }
  if (length === 0) throw new Error('Empty source');
  const bytes = Buffer.concat(chunks);
  const checksum = sha256(bytes);
  if (options.expectedChecksum && checksum !== options.expectedChecksum) throw new Error('Checksum mismatch');
  const snapshot: Snapshot = { ...source, checksum, bytes: length,
    fetchedAt: (options.now ?? (() => new Date()))().toISOString(),
    contentType: response.headers.get('content-type') ?? 'application/octet-stream' };
  await store.save(snapshot, bytes);
  return snapshot;
}
