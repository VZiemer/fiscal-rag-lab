import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { loadEvaluationDataset } from '../packages/evaluation/src/dataset.js';
import { MemoryCorpus } from '../packages/corpus/src/memory-corpus.js';
import { InMemoryFiscalRepository } from '../packages/fiscal-domain/src/code-repository.js';
import type { CorpusFile } from '../packages/application/src/corpus-file.js';

const demo = process.argv.includes('--demo');
const input = process.argv.slice(2).find(arg => !arg.startsWith('--')) ?? '.data/official/corpus.json';
const data: CorpusFile = demo ? { version: 1, evidence: (await loadEvaluationDataset()).corpus.list().slice(), codes: [] }
  : JSON.parse(await readFile(input, 'utf8'));
if (data.version !== 1 || !Array.isArray(data.codes) || !Array.isArray(data.evidence)) throw new Error('Invalid Lambda corpus');
new MemoryCorpus(data.evidence); new InMemoryFiscalRepository(data.codes);
if (!demo && (!data.codes.some(c => c.kind === 'ncm') || !data.codes.some(c => c.kind === 'cfop'))) throw new Error('Production package requires populated NCM and CFOP tables; --demo is only for explicit fixture builds');

await mkdir('.data/aws/package', { recursive: true });
await build({ entryPoints: ['apps/mcp-server/src/lambda.ts'], outfile: '.data/aws/package/index.mjs', bundle: true,
  platform: 'node', target: 'node22', format: 'esm', sourcemap: false, minify: true,
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' } });
await writeFile('.data/aws/package/corpus.json', JSON.stringify(data));
console.log(JSON.stringify({ package: '.data/aws/package', demo, evidence: data.evidence.length, codes: data.codes.length }));
