import { readFile, mkdir, writeFile, rename, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { assertProvenance } from '../../../packages/corpus/src/evidence.js';
import { MemoryCorpus } from '../../../packages/corpus/src/memory-corpus.js';
import { InMemoryFiscalRepository } from '../../../packages/fiscal-domain/src/code-repository.js';
import { chunkLegalDocument } from '../../../packages/retrieval/src/legal-chunker.js';
import { parseCfopXlsx, parseNcmJson } from './fiscal-parsers.js';
import { sha256, type Snapshot } from './snapshots.js';
import type { CorpusFile } from '../../../packages/application/src/corpus-file.js';

export interface CorpusBuildManifest {
  version: 1;
  snapshots: { metadataFile: string; format: 'cfop-xlsx' | 'ncm-json' | 'legal-text'; documentId?: string }[];
}

export async function buildCorpus(manifest: CorpusBuildManifest, baseDirectory = '.'): Promise<CorpusFile> {
  if (manifest.version !== 1 || !Array.isArray(manifest.snapshots) || !manifest.snapshots.length) throw new Error('Invalid corpus build manifest');
  const corpus: CorpusFile = { version: 1, evidence: [], codes: [] };
  for (const item of manifest.snapshots) {
    const metadataPath = resolve(baseDirectory, item.metadataFile);
    const metadata: Snapshot = JSON.parse(await readFile(metadataPath, 'utf8'));
    assertProvenance(metadata);
    const bytes = await readFile(join(dirname(metadataPath), `${metadata.checksum}.bin`));
    if (sha256(bytes) !== metadata.checksum || bytes.length !== metadata.bytes) throw new Error('Snapshot integrity check failed');
    const { bytes: _bytes, contentType: _type, ...provenance } = metadata;
    if (item.format === 'cfop-xlsx') corpus.codes.push(...await parseCfopXlsx(bytes, provenance));
    else if (item.format === 'ncm-json') corpus.codes.push(...parseNcmJson(new TextDecoder('utf-8', { fatal: true }).decode(bytes), provenance));
    else if (item.format === 'legal-text') {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
      if (!item.documentId || /^\s*</.test(text) || text.startsWith('%PDF')) throw new Error('legal-text requires documentId and plain UTF-8 text, not HTML/PDF');
      corpus.evidence.push(...chunkLegalDocument({ id: item.documentId, text, provenance }));
    } else throw new Error('Unsupported snapshot parser');
  }
  new MemoryCorpus(corpus.evidence);
  new InMemoryFiscalRepository(corpus.codes);
  return corpus;
}

export async function writeCorpusAtomically(path: string, corpus: CorpusFile): Promise<void> {
  await mkdir(dirname(resolve(path)), { recursive: true });
  const temporary = `${path}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(corpus, null, 2) + '\n', { flag: 'wx' });
    await rename(temporary, path);
  } catch (error) { await unlink(temporary).catch(() => undefined); throw error; }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [manifestFile, output = '.data/corpus.json'] = process.argv.slice(2);
  if (!manifestFile) throw new Error('Uso: npm run corpus:build -- manifest.json [saida.json]');
  const manifest: CorpusBuildManifest = JSON.parse(await readFile(manifestFile, 'utf8'));
  const corpus = await buildCorpus(manifest, dirname(resolve(manifestFile)));
  await writeCorpusAtomically(output, corpus);
  console.log(JSON.stringify({ evidence: corpus.evidence.length, codes: corpus.codes.length, output }));
}
