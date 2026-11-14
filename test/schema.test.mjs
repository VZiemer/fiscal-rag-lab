import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { Field, ObjectContract, ValidationError } from '../dist/packages/validation/src/schema.js';
import { searchInput, cfopInput, ncmInput, queryPlanSchema, lookupSchema } from '../dist/apps/mcp-server/src/contracts.js';
import { toMcpSchema } from '../dist/apps/mcp-server/src/schema-adapter.js';
import { behaviorResponseSchema } from '../dist/packages/evaluation/src/behavior.js';

test('contracts preserve trim, numeric limits, codes and calendar validation without coercion', () => {
  assert.deepEqual(searchInput.parse({ query: '  metal  ', topK: 50, date: '2024-02-29' }), { query: 'metal', topK: 50, date: '2024-02-29' });
  for (const input of [
    {}, { query: '  ' }, { query: 'x'.repeat(2001) }, { query: 'x', topK: '5' },
    { query: 'x', topK: 0 }, { query: 'x', topK: 51 }, { query: 'x', topK: 1.5 },
    { query: 'x', topK: Infinity }, { query: 'x', topK: NaN }, { query: 'x', topK: null },
    { query: 'x', date: '2026-02-29' }, { query: 'x', date: '2026-02-30' },
    { query: 'x', jurisdiction: 'mg' }, { query: 'x', mode: 'external' }, { query: 'x', extra: true }
  ]) assert.throws(() => searchInput.parse(input), ValidationError);
  assert.equal(cfopInput.parse({ code: '6.102' }).code, '6.102');
  assert.equal(ncmInput.parse({ code: '8302.10.00' }).code, '8302.10.00');
  assert.throws(() => cfopInput.parse({ code: '610' }), ValidationError);
  assert.throws(() => ncmInput.parse({ code: '8302' }), ValidationError);
});

test('nested errors are project-owned and schema composition retains strictness', () => {
  const item = new ObjectContract({ value: Field.text(), note: Field.text().nullable() });
  const envelope = new ObjectContract({ items: Field.list(item) });
  const result = envelope.safeParse({ items: [{ value: 9, note: null }] });
  assert.equal(result.success, false);
  assert.deepEqual(result.issues[0].path, ['items', 0, 'value']);
  assert.throws(() => envelope.parse({ items: [{ value: 'x', note: null, extra: true }] }), ValidationError);
  assert.throws(() => item.parse({ value: 'x' }), ValidationError);
  assert.deepEqual(item.parse({ value: 'x', note: null }), { value: 'x', note: null });
  const extended = new ObjectContract({ ...item.fields, score: Field.number() });
  assert.throws(() => extended.parse({ value: 'x', note: null, score: NaN }), ValidationError);
  assert.throws(() => { item.fields.extra = Field.text(); }, TypeError);
});

test('behavior defaults remain required in parsed output and mutable defaults are isolated', () => {
  const first = behaviorResponseSchema.parse({ action: 'abstain' });
  assert.deepEqual(first, { action: 'abstain', missingContext: [], citations: [], answer: '' });
  first.citations.push('changed');
  assert.deepEqual(behaviorResponseSchema.parse({ action: 'abstain' }).citations, []);
  assert.throws(() => behaviorResponseSchema.parse({ action: 'abstain', citations: null }), ValidationError);
  const initial = ['original'];
  const list = Field.list(Field.text()).withDefault(initial);
  initial.push('changed');
  assert.deepEqual(list.parse(undefined), ['original']);
});

test('query plans enforce the tool allowlist, matching arguments and batch bounds', () => {
  const calls = [
    { name: 'get_cfop', arguments: { code: '6102' } },
    { name: 'get_ncm', arguments: { code: '83021000' } },
    { name: 'search_regulations', arguments: { query: ' metal ' } },
    { name: 'explain_rule', arguments: { id: 'demo:art1' } }
  ];
  assert.equal(queryPlanSchema.parse({ calls }).calls[2].arguments.query, 'metal');
  assert.equal(queryPlanSchema.parse({ calls: Array(20).fill(calls[0]) }).calls.length, 20);
  for (const input of [
    { calls: [] }, { calls: Array(21).fill(calls[0]) }, { calls, extra: true },
    { calls: [{ name: 'fetch_url', arguments: { url: 'https://example.com' } }] },
    { calls: [{ name: 'get_cfop', arguments: { query: 'metal' } }] },
    { calls: [{ name: 'get_ncm', arguments: { code: '6102' } }] },
    { calls: [{ name: 'get_cfop', arguments: { code: '6102', extra: true } }] }
  ]) assert.throws(() => queryPlanSchema.parse(input), ValidationError);
});

test('MCP schema bridge advertises constraints and executes refinements, not only JSON Schema', () => {
  const standard = toMcpSchema(searchInput)['~standard'];
  const json = standard.jsonSchema.input({ target: 'draft-07' });
  assert.equal(json.type, 'object');
  assert.equal(json.additionalProperties, false);
  assert.deepEqual(json.required, ['query']);
  assert.equal(json.properties.query.minLength, 1);
  assert.equal(json.properties.query.maxLength, 2000);
  assert.equal(json.properties.topK.type, 'integer');
  assert.equal(json.properties.topK.maximum, 50);
  assert.deepEqual(json.properties.mode.enum, ['lexical', 'vector', 'hybrid']);
  assert.deepEqual(standard.validate({ query: '  metal ' }), { value: { query: 'metal' } });
  assert.ok(standard.validate({ query: 'x', date: '2026-02-30' }).issues);
  assert.equal(standard.jsonSchema.input({ target: 'draft-2020-12' }).type, 'object');
  assert.throws(() => standard.jsonSchema.input({ target: 'unsupported' }), /Unsupported/);
});

test('output contracts still reject invalid provenance and nested unknown properties', async () => {
  const fixture = JSON.parse(await readFile('test/fixtures/demo-corpus.json', 'utf8'));
  const good = { status: 'found', records: [{ ...fixture.codes[0], temporalStatus: 'unknown' }], missingContext: [], warning: '' };
  lookupSchema.parse(good);
  for (const [field, value] of [['sourceUrl', 'not-a-url'], ['fetchedAt', 'not-a-timestamp'], ['checksum', 'wrong'], ['extra', true]]) {
    const bad = structuredClone(good);
    bad.records[0].provenance[field] = value;
    assert.throws(() => lookupSchema.parse(bad), ValidationError);
  }
});

test('public declarations retain inference and do not expose vendor types', async () => {
  for (const file of ['dist/packages/validation/src/schema.d.ts', 'dist/apps/mcp-server/src/contracts.d.ts', 'dist/packages/evaluation/src/behavior.d.ts']) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /\bzod\b|\bZod\w*/);
  }
  const result = spawnSync(process.execPath, ['node_modules/typescript/lib/tsc.js', '--noEmit', '--strict', '--skipLibCheck',
    '--target', 'ES2022', '--module', 'NodeNext', '--moduleResolution', 'NodeNext', 'test/types/schema-contracts.ts'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.error?.message ?? result.stdout + result.stderr);
});
