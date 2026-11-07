import { performance } from 'node:perf_hooks';
import { cpus, totalmem, platform } from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { loadEvaluationDataset } from '../packages/evaluation/src/dataset.js';
import { recallAtK, reciprocalRankAtK, mean, percentile } from '../packages/evaluation/src/metrics.js';
import { InMemoryFiscalRepository } from '../packages/fiscal-domain/src/code-repository.js';
import { HashEmbeddingProvider } from '../packages/adapters/src/hash-embedding.js';
import { OllamaEmbeddingProvider } from '../packages/adapters/src/ollama-embedding.js';
import { BruteForceIndex } from '../packages/vector-core/src/brute-force-index.js';
import { IvfIndex } from '../packages/vector-core/src/ivf-index.js';
import { HnswIndex } from '../packages/vector-core/src/hnsw-index.js';
import { HybridRetriever } from '../packages/retrieval/src/hybrid.js';

const { dataset, corpus } = await loadEvaluationDataset();
const dimensions = Number(process.env.EMBEDDING_DIMENSIONS ?? 128);
const provider = process.env.EMBEDDING_PROVIDER === 'ollama'
  ? new OllamaEmbeddingProvider(process.env.EMBEDDING_MODEL ?? '', dimensions, process.env.OLLAMA_URL)
  : new HashEmbeddingProvider(dimensions);
const variants = [
  { name: 'bm25', mode: 'lexical' as const, index: new BruteForceIndex<string>(), parameters: { k1: 1.2, b: 0.75 } },
  { name: 'vector-exact', mode: 'vector' as const, index: new BruteForceIndex<string>(), parameters: {} },
  { name: 'hybrid-rrf', mode: 'hybrid' as const, index: new BruteForceIndex<string>(), parameters: { rrfConstant: 60 } },
  { name: 'vector-ivf', mode: 'vector' as const, index: new IvfIndex<string>(4, 2, 42), parameters: { nlist: 4, nprobe: 2, seed: 42 } },
  { name: 'vector-hnsw', mode: 'vector' as const, index: new HnswIndex<string>(4, 20, 10, 42), parameters: { m: 4, efConstruction: 20, efSearch: 10, seed: 42 } }
];
const results = [];
for (const variant of variants) {
  global.gc?.();
  const before = process.memoryUsage();
  const start = performance.now();
  const retriever = await HybridRetriever.create(corpus, new InMemoryFiscalRepository([]), provider, variant.index);
  if (variant.index instanceof IvfIndex) variant.index.build();
  const buildMs = performance.now() - start;
  global.gc?.();
  const after = process.memoryUsage();
  await retriever.search({ query: 'warmup query', mode: variant.mode });
  const rows: { id: string; category: string; ids: string[]; elapsedMs: number; recallAt5: number | null;
    recallAt10: number | null; reciprocalRankAt10: number | null; guardPassed: boolean | null; sources: string[] }[] = [];
  for (const item of dataset.cases) {
    const t = performance.now();
    const result = await retriever.search({ query: item.query, date: item.date, topK: 10, mode: variant.mode });
    const elapsedMs = performance.now() - t;
    const ids = result.evidence.map(e => e.id);
    const checks = [
      ...(item.route ? [result.route === item.route] : []),
      ...(item.lookupStatus ? [result.lookup?.status === item.lookupStatus] : []),
      ...(item.missingContext ? [item.missingContext.every(key => result.missingContext.includes(key))] : []),
      ...(item.empty ? [ids.length === 0] : []),
      ...(item.temporalStatus ? [result.evidence.length > 0 && result.evidence.every(e => e.temporalStatus === item.temporalStatus)] : [])
    ];
    rows.push({ id: item.id, category: item.category, ids, elapsedMs,
      recallAt5: recallAtK(ids, item.relevant, 5), recallAt10: recallAtK(ids, item.relevant, 10),
      reciprocalRankAt10: reciprocalRankAtK(ids, item.relevant, 10),
      guardPassed: checks.length ? checks.every(Boolean) : null,
      sources: [...new Set(result.evidence.map(e => e.provenance.sourceUrl))] });
  }
  const measured = rows.filter(r => r.recallAt5 !== null), guards = rows.filter(r => r.guardPassed !== null);
  results.push({ name: variant.name, parameters: variant.parameters, buildMs,
    heapDeltaBytes: after.heapUsed - before.heapUsed, rssDeltaBytes: after.rss - before.rss,
    recallAt5: mean(measured.map(r => r.recallAt5!)), recallAt10: mean(measured.map(r => r.recallAt10!)),
    mrrAt10: mean(measured.map(r => r.reciprocalRankAt10!)),
    guardPassRate: mean(guards.map(r => Number(r.guardPassed))), guardCases: guards.length,
    categories: [...new Set(rows.map(r => r.category))].map(category => {
      const group = rows.filter(r => r.category === category);
      return { category, count: group.length, meanMs: mean(group.map(r => r.elapsedMs)),
        p50Ms: percentile(group.map(r => r.elapsedMs), 0.5), p95Ms: percentile(group.map(r => r.elapsedMs), 0.95) };
    }), rows });
}
const datasetSha256 = createHash('sha256').update(await readFile('eval/heldout.json')).digest('hex');
const code = createHash('sha256');
for (const path of ['packages/retrieval/src/hybrid.ts', 'packages/retrieval/src/bm25.ts', 'packages/adapters/src/hash-embedding.ts',
  'packages/vector-core/src/ivf-index.ts', 'packages/vector-core/src/hnsw-index.ts', 'scripts/evaluate-retrieval.ts']) code.update(await readFile(path));
const report = { generatedAt: new Date().toISOString(),
  revision: execFileSync('git', ['-c', `safe.directory=${process.cwd()}`, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  codeSha256: code.digest('hex'), datasetSha256,
  conditions: { model: provider.model, dimensions: provider.dimensions, learnedEmbeddings: provider instanceof OllamaEmbeddingProvider,
    documents: corpus.list().length, queries: dataset.cases.length, rankedCases: 32, node: process.version, platform: platform(),
    cpu: cpus()[0].model, totalMemoryBytes: totalmem(), gcExposed: Boolean(global.gc), warmupQueries: 1, repeats: 1,
    caveats: ['Small editorial corpus, human fiscal review pending', 'No LLM or fiscal correctness measured',
      'Sequential memory deltas are noisy, not isolated memory usage',
      'Retriever exhausts candidates before legal filtering; HNSW expands ef to corpus size here. Use vector benchmark for ANN trade-offs.',
      'BM25 construction also initializes the vector index through the shared retriever; build time includes unused embeddings.',
      'Default FNV lexical hashing is not a semantic embedding model'] }, results };
const output = process.argv[2] ?? '.data/retrieval-results.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(results.map(({ rows, ...summary }) => summary), null, 2));
