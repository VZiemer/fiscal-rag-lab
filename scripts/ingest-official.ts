import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, relative, resolve } from 'node:path';
import { load } from 'cheerio';
import { downloadSnapshot, FileSnapshotStore, sha256, type SourceInput } from '../apps/ingestion-worker/src/snapshots.js';
import { officialSession } from '../apps/ingestion-worker/src/official-fetch.js';
import { decodeOfficialHtml, inspectOfficialHtml, type HtmlProfile } from '../apps/ingestion-worker/src/official-html.js';
import { buildCorpus, writeCorpusAtomically, type CorpusBuildManifest } from '../apps/ingestion-worker/src/build-corpus.js';
import type { CorpusFile } from '../packages/application/src/corpus-file.js';
import { MemoryCorpus } from '../packages/corpus/src/memory-corpus.js';
import { InMemoryFiscalRepository } from '../packages/fiscal-domain/src/code-repository.js';

interface CatalogSource extends Omit<SourceInput, 'publishedAt' | 'validFrom' | 'validTo'> {
  publishedAt?: string; format: CorpusBuildManifest['snapshots'][number]['format'] | 'archive';
  htmlProfile?: HtmlProfile; required?: boolean; crawlMg?: boolean;
}
const root = resolve(process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? '.data/official');
const reuse = process.argv.includes('--reuse');
await mkdir(root, { recursive: true });
const catalog = JSON.parse(await readFile('config/official-sources.json', 'utf8')) as {version: number; scope: string[]; sources: CatalogSource[]};
if (catalog.version !== 1) throw new Error('Unsupported official source catalog');
const session = officialSession(), store = new FileSnapshotStore(join(root, 'sources'));
const queue = [...catalog.sources], visited = new Set(queue.map(s => s.sourceUrl));
const manifest: CorpusBuildManifest = { version: 1, snapshots: [] };
const corpus: CorpusFile = { version: 1, evidence: [], codes: [] };
const results: Record<string, unknown>[] = [];
let requiredFailed = false;
for (let index = 0; index < queue.length; index++) {
  const item = queue[index];
  const source: SourceInput = { sourceId: item.sourceId, sourceUrl: item.sourceUrl, authority: item.authority,
    jurisdiction: item.jurisdiction, edition: `${item.edition}-${new Date().toISOString().slice(0, 10)}`,
    publishedAt: item.publishedAt ?? null, validFrom: null, validTo: null };
  let checksum: string | undefined;
  try {
    const existing = reuse ? (await store.list(item.sourceId)).filter(s => s.sourceUrl === item.sourceUrl).sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0] : undefined;
    const snapshot = existing ?? await downloadSnapshot(source, store, { fetch: session });
    checksum = snapshot.checksum;
    const bytes = await readFile(join(root, 'sources', item.sourceId, `${checksum}.bin`));
    const metadataFile = relative(root, join(root, 'sources', item.sourceId, `${checksum}-${sha256(JSON.stringify(snapshot, null, 2))}.json`)).replaceAll('\\', '/');
    if (item.crawlMg) {
      const $ = load(decodeOfficialHtml(bytes, snapshot.contentType));
      for (const link of $('a[href]').toArray()) {
        const url = new URL($(link).attr('href')!, item.sourceUrl); url.hash = '';
        if (url.origin !== 'https://www.fazenda.mg.gov.br' || !/^\/empresas\/legislacao_tributaria\/ricms_2023_seco\/(?:regulamento|anexo)[a-z\d_]+\.html$/.test(url.pathname) || url.search || visited.has(url.href)) continue;
        if (visited.size >= 110) throw new Error('MG crawl limit exceeded');
        visited.add(url.href);
        queue.push({ ...item, required: false, sourceId: `mg-${url.pathname.split('/').at(-1)!.replace('.html', '')}`,
          sourceUrl: url.href, format: 'official-html', htmlProfile: 'mg', crawlMg: true });
      }
    }
    let evidence = 0, codes = 0, omittedSections = 0;
    if (item.format !== 'archive') {
      const entry = { metadataFile, format: item.format, documentId: item.sourceId, ...(item.htmlProfile ? { htmlProfile: item.htmlProfile } : {}) };
      const parsed = await buildCorpus({ version: 1, snapshots: [entry] }, root);
      if (item.htmlProfile) omittedSections = inspectOfficialHtml(decodeOfficialHtml(bytes, snapshot.contentType), item.htmlProfile, item.sourceId, snapshot).omittedSections;
      evidence = parsed.evidence.length; codes = parsed.codes.length;
      corpus.evidence.push(...parsed.evidence); corpus.codes.push(...parsed.codes); manifest.snapshots.push(entry);
    } else if (bytes.subarray(0, 2).toString() !== 'PK' && !snapshot.contentType.includes('text/html') && !bytes.subarray(0, 4).equals(Buffer.from('%PDF'))) {
      throw new Error('Unrecognized archive content');
    }
    results.push({ sourceId: item.sourceId, url: item.sourceUrl, jurisdiction: item.jurisdiction, edition: snapshot.edition,
      checksum, bytes: snapshot.bytes, contentType: snapshot.contentType, fetchedAt: snapshot.fetchedAt,
      status: item.format === 'archive' ? 'downloaded-not-indexed' : 'indexed', evidence, codes, omittedSections });
    console.log(JSON.stringify({ source: item.sourceId, status: results.at(-1)!.status, evidence, codes }));
  } catch (error) {
    requiredFailed ||= item.required === true;
    const reason = error instanceof Error ? `${error.message}${error.cause instanceof Error ? `: ${error.cause.message}` : ''}` : String(error);
    results.push({ sourceId: item.sourceId, url: item.sourceUrl, jurisdiction: item.jurisdiction, checksum,
      status: 'failed', reason, todo: 'Review official access/schema; do not substitute a mirror or invent evidence.' });
    console.log(JSON.stringify({ source: item.sourceId, status: 'failed', reason }));
  }
  // Save progress after every source so interrupted downloads remain auditable and reusable.
  await writeFile(join(root, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), scope: catalog.scope, results }, null, 2) + '\n');
}
if (requiredFailed || !['SP', 'MG'].every(uf => corpus.evidence.some(e => e.provenance.jurisdiction === uf))) throw new Error('Required NCM/CFOP or state coverage failed; active corpus was not replaced. See report.json');
// Match manifest rebuild order while retaining stable content-based code evidence identifiers.
corpus.evidence = [...corpus.evidence.filter(e => !e.id.startsWith('code:')), ...corpus.evidence.filter(e => e.id.startsWith('code:'))];
new MemoryCorpus(corpus.evidence); new InMemoryFiscalRepository(corpus.codes);
await writeFile(join(root, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeCorpusAtomically(join(root, 'corpus.json'), corpus);
await writeCorpusAtomically('.data/corpus.json', corpus);
const summary = { generatedAt: new Date().toISOString(), scope: catalog.scope,
  evidence: corpus.evidence.length, ncm: corpus.codes.filter(c => c.kind === 'ncm').length, cfop: corpus.codes.filter(c => c.kind === 'cfop').length,
  indexedSources: manifest.snapshots.length, downloadedSources: results.filter(r => r.status !== 'failed').length,
  corpusChecksum: sha256(JSON.stringify(corpus, null, 2) + '\n'), packageCorpusChecksum: sha256(JSON.stringify(corpus)),
  evidenceByJurisdiction: Object.fromEntries(catalog.scope.map(uf => [uf, corpus.evidence.filter(e => e.provenance.jurisdiction === uf).length])),
  results };
await writeFile(join(root, 'report.json'), JSON.stringify(summary, null, 2) + '\n');
await mkdir('docs/data', { recursive: true });
await writeFile('docs/data/official-corpus.json', JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ output: join(root, 'corpus.json'), sources: manifest.snapshots.length,
  evidence: corpus.evidence.length, ncm: corpus.codes.filter(c => c.kind === 'ncm').length, cfop: corpus.codes.filter(c => c.kind === 'cfop').length }));
