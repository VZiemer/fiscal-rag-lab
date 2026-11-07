import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { lookupSchema, searchOutput, explainOutput } from '../apps/mcp-server/src/contracts.js';

// Operational acceptance case, separate from held-out retrieval metrics and fiscal legal review.
const scenario = JSON.parse(await readFile('eval/scenarios/initial-hardware-sale.json', 'utf8'));
const endpoint = 'https://d2kvl1uo6lcsgz.cloudfront.net/mcp';
const client = new Client({ name: 'initial-hardware-sale-contract', version: '1' }, { versionNegotiation: { mode: 'auto' } });
const checks: { name: string; evidence: unknown }[] = [];
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  for (const [kind, code] of [['cfop', scenario.expectedCfop], ['cfop', scenario.comparisonCfop], ['ncm', scenario.userSuppliedContext.ncm]] as const) {
    const response = await client.callTool({ name: `get_${kind}`, arguments: { code, date: scenario.userSuppliedContext.issueDate } });
    assert.ok(!response.isError);
    const data = lookupSchema.parse(response.structuredContent);
    assert.equal(data.status, 'found'); assert.equal(data.records.length, 1);
    const record = data.records[0]; assert.equal(record.code, code);
    const reference = scenario.evidenceReferences.find((r: {tool: string; code: string}) => r.tool === `get_${kind}` && r.code === code);
    assert.equal(record.provenance.sourceUrl, reference.sourceUrl);
    if (kind === 'cfop' && code === scenario.expectedCfop) assert.match(record.notes ?? '', /adquiridas ou recebidas de terceiros/);
    if (kind === 'cfop' && code === scenario.comparisonCfop) assert.match(record.notes ?? '', /destinadas a não contribuintes/);
    if (kind === 'ncm') assert.match(record.description, /Dobradiças/);
    if (reference.checksum) assert.equal(record.provenance.checksum, reference.checksum);
    assert.equal(record.temporalStatus, 'unknown');
    checks.push({ name: `${kind}:${code}`, evidence: { sourceId: record.provenance.sourceId, checksum: record.provenance.checksum, temporalStatus: record.temporalStatus } });
  }
  const search = searchOutput.parse((await client.callTool({ name: 'search_regulations', arguments: {
    query: 'dobradiças 8302.10.00 substituição tributária', jurisdiction: 'MG', mode: 'lexical', topK: 6, date: scenario.userSuppliedContext.issueDate
  } })).structuredContent);
  const st = search.evidence.find(e => e.provenance.jurisdiction === 'MG' && e.text.includes('8302.10.00') && e.text.includes('10.076.00'));
  assert.ok(st, 'ST-related documentary evidence must be retrieved; user declaration is not legal verification');
  const opened = explainOutput.parse((await client.callTool({ name: 'explain_rule', arguments: { id: st.id, date: scenario.userSuppliedContext.issueDate } })).structuredContent);
  assert.equal(opened.evidence?.id, st.id);
  checks.push({ name: 'st-review-required', evidence: { id: st.id, sourceUrl: st.provenance.sourceUrl, checksum: st.provenance.checksum } });
  assert.equal(scenario.expectedAnswerStatus, 'conditional');
  assert.equal(scenario.requiresSTReview, true); assert.equal(scenario.requiresTemporalQualification, true);
  const report = { testedAt: new Date().toISOString(), endpoint, scenario: scenario.id, status: 'passed-documentary-contract', checks,
    answerStatus: 'conditional', legalApplicability: 'not-certified', humanFiscalReview: 'not-run',
    limitations: ['The user-reported absence of tax substitution (ST) has not been confirmed.', 'Unknown validity does not establish applicability on the specified date.', 'Does not evaluate an LLM response or tool selection.'] };
  const output = process.argv[2] ?? '.data/initial-scenario-contract.json';
  await mkdir(dirname(output), { recursive: true }); await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ scenario: scenario.id, status: report.status, output }));
} finally { await client.close(); }
