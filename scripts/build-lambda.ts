import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { loadEvaluationDataset } from '../packages/evaluation/src/dataset.js';

await mkdir('.data/aws/package', { recursive: true });
await build({ entryPoints: ['apps/mcp-server/src/lambda.ts'], outfile: '.data/aws/package/index.mjs', bundle: true,
  platform: 'node', target: 'node22', format: 'esm', sourcemap: false, minify: true,
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' } });
const { corpus } = await loadEvaluationDataset();
await writeFile('.data/aws/package/corpus.json', JSON.stringify({ version: 1, evidence: corpus.list(), codes: [] }));
console.log('Bundle Lambda e corpus editorial preparados; somente index.mjs e corpus.json devem entrar no ZIP.');
