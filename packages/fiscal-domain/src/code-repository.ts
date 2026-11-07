import { assertDate, assertProvenance, temporalStatus, type Provenance, type TemporalStatus } from '../../corpus/src/evidence.js';

export type CodeKind = 'cfop' | 'ncm';
export interface FiscalCode {
  kind: CodeKind;
  code: string;
  description: string;
  notes: string | null;
  provenance: Provenance;
}
export interface CodeLookup {
  status: 'found' | 'not-found' | 'insufficient-evidence' | 'ambiguous';
  records: (FiscalCode & { temporalStatus: TemporalStatus })[];
  missingContext: string[];
  warning: string;
}
export interface FiscalRuleRepository { lookup(kind: CodeKind, code: string, date?: string): CodeLookup }

export function normalizeCode(kind: CodeKind, value: string): string {
  const pattern = kind === 'cfop' ? /^(?:[123567]\d{3}|[123567]\.\d{3})$/ : /^(?:\d{8}|\d{4}\.\d{2}\.\d{2})$/;
  if (!pattern.test(value)) throw new Error(`Invalid ${kind} code`);
  return value.replaceAll('.', '');
}

export class InMemoryFiscalRepository implements FiscalRuleRepository {
  private readonly records = new Map<string, FiscalCode[]>();
  constructor(records: readonly FiscalCode[]) {
    for (const input of records) {
      assertProvenance(input.provenance);
      const record = structuredClone(input);
      record.code = normalizeCode(record.kind, record.code);
      if (!record.description?.trim()) throw new Error('Code description required');
      const key = `${record.kind}:${record.code}`;
      const versions = this.records.get(key) ?? [];
      if (versions.some(v => v.provenance.edition === record.provenance.edition &&
        v.provenance.sourceId === record.provenance.sourceId && v.provenance.validFrom === record.provenance.validFrom &&
        v.provenance.validTo === record.provenance.validTo)) throw new Error('Duplicate code version');
      versions.push(record);
      this.records.set(key, versions);
    }
  }
  lookup(kind: CodeKind, code: string, date?: string): CodeLookup {
    if (date !== undefined) assertDate(date);
    const versions = this.records.get(`${kind}:${normalizeCode(kind, code)}`) ?? [];
    const records = versions.map(record => ({ ...structuredClone(record),
      temporalStatus: date ? temporalStatus(record.provenance, date) : 'unknown' as const
    })).filter(record => record.temporalStatus !== 'outside-validity');
    return {
      status: records.length === 0 ? (versions.length ? 'insufficient-evidence' : 'not-found')
        : records.length > 1 ? 'ambiguous' : 'found',
      records,
      missingContext: [...(!date ? ['date'] : []), 'originUF', 'destinationUF', 'regime', 'operation'],
      warning: 'Document lookup; a matching code does not determine applicability to the transaction. Unknown validity requires checking the source.'
    };
  }
}
