import { readFile } from 'node:fs/promises';
import { MemoryCorpus } from '../../corpus/src/memory-corpus.js';
import { assertDate, assertProvenance, type Provenance, type TemporalStatus } from '../../corpus/src/evidence.js';

export interface EvalCase {
  id: string; category: 'retrieval' | 'exact' | 'context' | 'abstention' | 'temporal'; query: string; relevant: string[];
  route?: 'cfop' | 'ncm'; lookupStatus?: string; missingContext?: string[]; empty?: boolean; date?: string; temporalStatus?: TemporalStatus;
}
export interface EvaluationDataset {
  version: 1; split: 'heldout'; reviewStatus: string; sources: Record<string, Provenance>;
  documents: { id: string; source: string; text: string }[]; cases: EvalCase[];
}
export async function loadEvaluationDataset(path = 'eval/heldout.json'): Promise<{ dataset: EvaluationDataset; corpus: MemoryCorpus }> {
  const dataset: EvaluationDataset = JSON.parse(await readFile(path, 'utf8'));
  if (dataset.version !== 1 || dataset.split !== 'heldout' || !dataset.documents.length || !dataset.cases.length) throw new Error('Invalid evaluation dataset');
  Object.values(dataset.sources).forEach(assertProvenance);
  const corpus = new MemoryCorpus(dataset.documents.map(d => {
    if (!dataset.sources[d.source]) throw new Error('Unknown source');
    return { id: d.id, documentId: dataset.sources[d.source].sourceId, text: d.text, article: null,
      parentId: null, relatedIds: [], provenance: dataset.sources[d.source] };
  }));
  const ids = new Set<string>(), queries = new Set<string>();
  for (const item of dataset.cases) {
    const normalized = item.query.trim().toLowerCase();
    if (ids.has(item.id) || queries.has(normalized) || !normalized || item.relevant.some(id => !corpus.get(id))) throw new Error('Duplicate or unresolved eval case');
    ids.add(item.id); queries.add(normalized);
    if (item.date) assertDate(item.date);
  }
  return { dataset, corpus };
}
