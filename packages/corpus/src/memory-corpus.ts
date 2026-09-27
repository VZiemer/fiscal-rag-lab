import { assertProvenance, type CorpusRepository, type Evidence } from './evidence.js';

export function assertEvidence(value: unknown): asserts value is Evidence {
  if (typeof value !== 'object' || value === null) throw new Error('Invalid evidence');
  const e = value as Evidence;
  if (typeof e.id !== 'string' || !e.id || typeof e.documentId !== 'string' || !e.documentId || typeof e.text !== 'string' || !e.text.trim() ||
      !(e.article === null || typeof e.article === 'string') || !(e.parentId === null || typeof e.parentId === 'string') ||
      !Array.isArray(e.relatedIds) || e.relatedIds.some(id => typeof id !== 'string')) throw new Error('Invalid evidence fields');
  assertProvenance(e.provenance);
}
export class MemoryCorpus implements CorpusRepository {
  private readonly documents = new Map<string, Evidence>();
  constructor(evidence: readonly Evidence[]) {
    for (const e of evidence) {
      assertEvidence(e);
      if (this.documents.has(e.id)) throw new Error('Duplicate evidence id');
      this.documents.set(e.id, structuredClone(e));
    }
    for (const e of evidence) for (const id of [...e.relatedIds, ...(e.parentId ? [e.parentId] : [])]) {
      if (!this.documents.has(id)) throw new Error(`Unresolved legal relationship: ${id}`);
    }
  }
  list(): readonly Evidence[] { return structuredClone([...this.documents.values()]); }
  get(id: string): Evidence | undefined {
    const item = this.documents.get(id);
    return item ? structuredClone(item) : undefined;
  }
}
