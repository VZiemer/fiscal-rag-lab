import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { MemoryCorpus } from '../../../packages/corpus/src/memory-corpus.js';
import { InMemoryFiscalRepository } from '../../../packages/fiscal-domain/src/code-repository.js';
import type { CorpusFile } from '../../../packages/application/src/corpus-file.js';
import { HashEmbeddingProvider } from '../../../packages/adapters/src/hash-embedding.js';
import { OllamaEmbeddingProvider } from '../../../packages/adapters/src/ollama-embedding.js';
import { BruteForceIndex } from '../../../packages/vector-core/src/brute-force-index.js';
import { HybridRetriever } from '../../../packages/retrieval/src/hybrid.js';
import type { Services } from './server.js';

export interface LoadedServices extends Services {
  stats: { checksum: string; evidence: number; cfop: number; ncm: number; jurisdictions: string[] };
}
export async function loadServices(file: string, embedding = { provider: 'hash', model: 'lexical-fnv1a-v1', dimensions: 128, url: 'http://127.0.0.1:11434' }): Promise<LoadedServices> {
  const raw = await readFile(file, 'utf8');
  const data = JSON.parse(raw) as CorpusFile;
  if (data?.version !== 1 || !Array.isArray(data.evidence) || !Array.isArray(data.codes)) throw new Error('Invalid corpus file');
  const corpus = new MemoryCorpus(data.evidence), codes = new InMemoryFiscalRepository(data.codes);
  const provider = embedding.provider === 'ollama' ? new OllamaEmbeddingProvider(embedding.model, embedding.dimensions, embedding.url)
    : embedding.provider === 'hash' && embedding.model === 'lexical-fnv1a-v1' ? new HashEmbeddingProvider(embedding.dimensions) : undefined;
  if (!provider) throw new Error('Unsupported embedding configuration');
  const retriever = await HybridRetriever.create(corpus, codes, provider, new BruteForceIndex<string>());
  return { corpus, codes, retriever, stats: { checksum: createHash('sha256').update(raw).digest('hex'), evidence: data.evidence.length,
    cfop: data.codes.filter(c => c.kind === 'cfop').length, ncm: data.codes.filter(c => c.kind === 'ncm').length,
    jurisdictions: [...new Set(data.evidence.map(e => e.provenance.jurisdiction))].sort() } };
}
