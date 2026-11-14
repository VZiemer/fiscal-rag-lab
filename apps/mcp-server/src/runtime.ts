import { readFile } from 'node:fs/promises';
import { MemoryCorpus } from '../../../packages/corpus/src/memory-corpus.js';
import type { Evidence } from '../../../packages/corpus/src/evidence.js';
import { InMemoryFiscalRepository, type FiscalCode } from '../../../packages/fiscal-domain/src/code-repository.js';
import { HashEmbeddingProvider } from '../../../packages/adapters/src/hash-embedding.js';
import { OllamaEmbeddingProvider } from '../../../packages/adapters/src/ollama-embedding.js';
import { BruteForceIndex } from '../../../packages/vector-core/src/brute-force-index.js';
import { HybridRetriever } from '../../../packages/retrieval/src/hybrid.js';
import type { Services } from './server.js';

export interface CorpusFile { version: 1; evidence: Evidence[]; codes: FiscalCode[] }
export async function loadServices(file: string, embedding = { provider: 'hash', model: 'lexical-fnv1a-v1', dimensions: 128, url: 'http://127.0.0.1:11434' }): Promise<Services> {
  const data = JSON.parse(await readFile(file, 'utf8')) as CorpusFile;
  if (data?.version !== 1 || !Array.isArray(data.evidence) || !Array.isArray(data.codes)) throw new Error('Invalid corpus file');
  const corpus = new MemoryCorpus(data.evidence), codes = new InMemoryFiscalRepository(data.codes);
  const provider = embedding.provider === 'ollama' ? new OllamaEmbeddingProvider(embedding.model, embedding.dimensions, embedding.url)
    : embedding.provider === 'hash' && embedding.model === 'lexical-fnv1a-v1' ? new HashEmbeddingProvider(embedding.dimensions) : undefined;
  if (!provider) throw new Error('Unsupported embedding configuration');
  const retriever = await HybridRetriever.create(corpus, codes, provider, new BruteForceIndex<string>());
  return { corpus, codes, retriever };
}
