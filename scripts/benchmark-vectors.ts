import { performance } from 'node:perf_hooks';
import { cpus, totalmem, platform, arch } from 'node:os';
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { BruteForceIndex } from '../packages/vector-core/src/brute-force-index.js';
import { IvfIndex } from '../packages/vector-core/src/ivf-index.js';
import { HnswIndex } from '../packages/vector-core/src/hnsw-index.js';
import { seededRandom } from '../packages/vector-core/src/kmeans.js';

const seed = 20261114, count = 1000, dimensions = 32, queryCount = 100, k = 10, repeats = 3;
const random = seededRandom(seed);
const vector = () => new Float32Array(Array.from({ length: dimensions }, () => random() * 2 - 1));
const points = Array.from({ length: count }, vector), queries = Array.from({ length: queryCount }, vector);
const exact = new BruteForceIndex<number>();
points.forEach((p, i) => exact.add(String(i), p, i));
const truth = queries.map(q => new Set(exact.search(q, k).map(h => h.id)));
const variants = [
  { name: 'exact', params: {}, index: new BruteForceIndex<number>() },
  { name: 'ivf', params: { nlist: 16, nprobe: 4, seed: 42 }, index: new IvfIndex<number>(16, 4, 42) },
  { name: 'hnsw', params: { m: 12, efConstruction: 100, efSearch: 64, seed: 42 }, index: new HnswIndex<number>(12, 100, 64, 42) }
];
const results = [];
for (const { name, params, index } of variants) {
  global.gc?.();
  const before = process.memoryUsage();
  const start = performance.now();
  points.forEach((p, i) => index.add(String(i), p, i));
  if (index instanceof IvfIndex) index.build();
  const buildMs = performance.now() - start;
  global.gc?.();
  const after = process.memoryUsage();
  queries.slice(0, 5).forEach(q => index.search(q, k));
  const times: number[] = [];
  let matched = 0;
  for (let repeat = 0; repeat < repeats; repeat++) queries.forEach((q, i) => {
    const t = performance.now();
    const hits = index.search(q, k);
    times.push(performance.now() - t);
    matched += hits.filter(h => truth[i].has(h.id)).length;
  });
  times.sort((a, b) => a - b);
  results.push({ name, params, buildMs, recallAt10: matched / (queryCount * repeats * k),
    meanMs: times.reduce((s, t) => s + t, 0) / times.length, p50Ms: times[Math.floor(times.length * 0.5)],
    p95Ms: times[Math.ceil(times.length * 0.95) - 1], heapDeltaBytes: after.heapUsed - before.heapUsed,
    rssDeltaBytes: after.rss - before.rss,
    representationBytes: index instanceof BruteForceIndex ? Buffer.byteLength(index.serialize('synthetic-uniform-v1'))
      : index instanceof HnswIndex ? index.diagnostics().representationBytes : null });
}
const files = ['similarity.ts', 'brute-force-index.ts', 'kmeans.ts', 'ivf-index.ts', 'hnsw-index.ts'];
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(`packages/vector-core/src/${file}`));
const report = { generatedAt: new Date().toISOString(), codeSha256: hash.digest('hex'),
  conditions: { seed, count, dimensions, queryCount, k, repeats, warmupQueries: 5,
    dataset: 'synthetic-uniform-v1; independent queries; no fiscal/semantic claims', node: process.version,
    platform: platform(), arch: arch(), cpu: cpus()[0].model, logicalCpus: cpus().length,
    totalMemoryBytes: totalmem(), gcExposed: Boolean(global.gc),
    memoryCaveat: 'Sequential process deltas after GC; RSS includes runtime/JIT, not isolated index memory. JSON byte sizes are diagnostic; IVF size not measured.' }, results };
const output = process.argv[2] ?? '.data/vector-benchmark.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
