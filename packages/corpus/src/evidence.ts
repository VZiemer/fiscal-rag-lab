export interface Provenance {
  sourceId: string;
  sourceUrl: string;
  authority: string;
  jurisdiction: string;
  edition: string;
  fetchedAt: string;
  publishedAt: string | null;
  validFrom: string | null;
  validTo: string | null;
  checksum: string;
}

export function assertDate(value: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value) throw new Error('Invalid ISO date');
}

export function assertProvenance(p: Provenance): void {
  const url = new URL(p.sourceUrl);
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Official HTTPS URL required');
  if (!url.hostname.endsWith('.gov.br')) throw new Error('Official government source required');
  for (const field of ['sourceId', 'authority', 'jurisdiction', 'edition'] as const) {
    if (typeof p[field] !== 'string' || !p[field].trim()) throw new Error(`Missing ${field}`);
  }
  if (!/^[a-f0-9]{64}$/.test(p.checksum)) throw new Error('Invalid SHA-256');
  if (!Number.isFinite(Date.parse(p.fetchedAt))) throw new Error('Invalid fetchedAt');
  for (const date of [p.publishedAt, p.validFrom, p.validTo]) if (date !== null) assertDate(date);
  if (p.validFrom && p.validTo && p.validFrom > p.validTo) throw new Error('Inverted validity interval');
}

export type TemporalStatus = 'valid' | 'outside-validity' | 'unknown';
export function temporalStatus(p: Pick<Provenance, 'validFrom' | 'validTo'>, date: string): TemporalStatus {
  assertDate(date);
  if ((p.validFrom && date < p.validFrom) || (p.validTo && date > p.validTo)) return 'outside-validity';
  // An unknown boundary is not proof that an edition applies to the requested date.
  return p.validFrom && p.validTo ? 'valid' : 'unknown';
}

export interface Evidence {
  id: string;
  documentId: string;
  text: string;
  article: string | null;
  parentId: string | null;
  relatedIds: string[];
  provenance: Provenance;
}

export interface CorpusRepository {
  list(): readonly Evidence[];
  get(id: string): Evidence | undefined;
}
