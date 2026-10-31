import { Field, ObjectContract, type Infer } from '../../../packages/validation/src/schema.js';
import { assertDate } from '../../../packages/corpus/src/evidence.js';

const date = Field.text({
  check: value => { try { assertDate(value); return true; } catch { return false; } },
  message: 'Data ISO inválida'
});
const nullableDate = date.nullable();
export const provenanceSchema = new ObjectContract({
  sourceId: Field.text(),
  sourceUrl: Field.url(),
  authority: Field.text(),
  jurisdiction: Field.text(),
  edition: Field.text(),
  fetchedAt: Field.timestamp(),
  publishedAt: nullableDate,
  validFrom: nullableDate,
  validTo: nullableDate,
  checksum: Field.text({ pattern: /^[a-f0-9]{64}$/ })
});
export const evidenceSchema = new ObjectContract({
  id: Field.text(),
  documentId: Field.text(),
  text: Field.text(),
  article: Field.text().nullable(),
  parentId: Field.text().nullable(),
  relatedIds: Field.list(Field.text()),
  provenance: provenanceSchema
});
const temporal = Field.choice(['valid', 'outside-validity', 'unknown']);
const codeRecord = new ObjectContract({
  kind: Field.choice(['cfop', 'ncm']),
  code: Field.text(),
  description: Field.text(),
  notes: Field.text().nullable(),
  provenance: provenanceSchema,
  temporalStatus: temporal
});
export const lookupSchema = new ObjectContract({
  status: Field.choice(['found', 'not-found', 'insufficient-evidence', 'ambiguous']),
  records: Field.list(codeRecord),
  missingContext: Field.list(Field.text()),
  warning: Field.text()
});

export const searchInput = new ObjectContract({
  query: Field.text({ trim: true, minLength: 1, maxLength: 2000 }),
  date: date.optional(),
  jurisdiction: Field.text({ pattern: /^(BR|[A-Z]{2})$/ }).optional(),
  topK: Field.integer({ min: 1, max: 50 }).optional(),
  mode: Field.choice(['lexical', 'vector', 'hybrid']).optional()
});
const rankedEvidence = new ObjectContract({
  ...evidenceSchema.fields,
  score: Field.number(),
  temporalStatus: temporal,
  relatedEvidence: Field.list(evidenceSchema)
});
export const searchOutput = new ObjectContract({
  route: Field.choice(['cfop', 'ncm', 'lexical', 'vector', 'hybrid']),
  evidence: Field.list(rankedEvidence),
  lookup: lookupSchema.nullable(),
  missingContext: Field.list(Field.text()),
  warning: Field.text()
});
export const cfopInput = new ObjectContract({
  code: Field.text({ pattern: /^(?:[123567]\d{3}|[123567]\.\d{3})$/ }),
  date: date.optional()
});
export const ncmInput = new ObjectContract({
  code: Field.text({ pattern: /^(?:\d{8}|\d{4}\.\d{2}\.\d{2})$/ }),
  date: date.optional()
});
export const explainInput = new ObjectContract({
  id: Field.text({ minLength: 1, maxLength: 200 }),
  date: date.optional()
});
export const explainOutput = new ObjectContract({
  evidence: evidenceSchema.nullable(),
  relatedEvidence: Field.list(evidenceSchema),
  warning: Field.text()
});

const callSchema = Field.union([
  new ObjectContract({ name: Field.literal('get_cfop'), arguments: cfopInput }),
  new ObjectContract({ name: Field.literal('get_ncm'), arguments: ncmInput }),
  new ObjectContract({ name: Field.literal('search_regulations'), arguments: searchInput }),
  new ObjectContract({ name: Field.literal('explain_rule'), arguments: explainInput })
]);
export const queryPlanSchema = new ObjectContract({
  calls: Field.list(callSchema, { minItems: 1, maxItems: 20 })
});
export type RagToolCall = Infer<typeof callSchema>;
export const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } as const;
