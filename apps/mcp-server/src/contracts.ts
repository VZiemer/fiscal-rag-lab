import { z } from 'zod';
import { assertDate } from '../../../packages/corpus/src/evidence.js';

const date = z.string().refine(value => { try { assertDate(value); return true; } catch { return false; } }, 'Data ISO inválida');
const nullableDate = date.nullable();
export const provenanceSchema = z.object({
  sourceId: z.string(), sourceUrl: z.url(), authority: z.string(), jurisdiction: z.string(), edition: z.string(),
  fetchedAt: z.iso.datetime(), publishedAt: nullableDate, validFrom: nullableDate, validTo: nullableDate,
  checksum: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();
export const evidenceSchema = z.object({
  id: z.string(), documentId: z.string(), text: z.string(), article: z.string().nullable(), parentId: z.string().nullable(),
  relatedIds: z.array(z.string()), provenance: provenanceSchema
}).strict();
const temporal = z.enum(['valid', 'outside-validity', 'unknown']);
export const lookupSchema = z.object({
  status: z.enum(['found', 'not-found', 'insufficient-evidence', 'ambiguous']),
  records: z.array(z.object({ kind: z.enum(['cfop', 'ncm']), code: z.string(), description: z.string(), notes: z.string().nullable(),
    provenance: provenanceSchema, temporalStatus: temporal }).strict()),
  missingContext: z.array(z.string()), warning: z.string()
}).strict();
export const searchInput = z.object({
  query: z.string().trim().min(1).max(2000), date: date.optional(), jurisdiction: z.string().regex(/^(BR|[A-Z]{2})$/).optional(),
  topK: z.number().int().min(1).max(50).optional(), mode: z.enum(['lexical', 'vector', 'hybrid']).optional()
}).strict();
export const searchOutput = z.object({
  route: z.enum(['cfop', 'ncm', 'lexical', 'vector', 'hybrid']),
  evidence: z.array(evidenceSchema.extend({ score: z.number(), temporalStatus: temporal, relatedEvidence: z.array(evidenceSchema) }).strict()),
  lookup: lookupSchema.nullable(), missingContext: z.array(z.string()), warning: z.string()
}).strict();
export const cfopInput = z.object({ code: z.string().regex(/^(?:[123567]\d{3}|[123567]\.\d{3})$/), date: date.optional() }).strict();
export const ncmInput = z.object({ code: z.string().regex(/^(?:\d{8}|\d{4}\.\d{2}\.\d{2})$/), date: date.optional() }).strict();
export const explainInput = z.object({ id: z.string().min(1).max(200), date: date.optional() }).strict();
export const explainOutput = z.object({ evidence: evidenceSchema.nullable(), relatedEvidence: z.array(evidenceSchema), warning: z.string() }).strict();
export const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
