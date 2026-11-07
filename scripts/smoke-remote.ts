import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { lookupSchema, searchOutput, explainOutput } from '../apps/mcp-server/src/contracts.js';

const endpoint = process.argv[2];
if (!endpoint) throw new Error('Usage: npm run smoke:remote -- https://your-domain/mcp [report.json]');
const url = new URL(endpoint);
if (url.protocol !== 'https:' || url.username || url.password) throw new Error('HTTPS endpoint without credentials required');
const observations: unknown[] = [];
const expectedCorpus = await readFile('.data/aws/package/corpus.json');
const expected = JSON.parse(expectedCorpus.toString());
for (const path of ['/', '/privacy', '/health']) {
  const response = await fetch(new URL(path, url), { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, path);
  if (path === '/health') {
    const health = await response.json();
    assert.equal(health.corpus.checksum, createHash('sha256').update(expectedCorpus).digest('hex'));
    assert.equal(health.corpus.evidence, expected.evidence.length);
    assert.equal(health.corpus.ncm, expected.codes.filter((c: {kind: string}) => c.kind === 'ncm').length);
    assert.equal(health.corpus.cfop, expected.codes.filter((c: {kind: string}) => c.kind === 'cfop').length);
    assert.ok(health.corpus.ncm > 0 && health.corpus.cfop > 0);
    observations.push({ health });
  }
  observations.push({ path, status: response.status });
}
for (const mode of ['legacy', 'auto'] as const) {
  const client = new Client({ name: 'fiscal-remote-smoke', version: '1' }, { versionNegotiation: { mode } });
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    const tools = (await client.listTools()).tools;
    assert.equal(tools.length, 4);
    const search = await client.callTool({ name: 'search_regulations', arguments: { query: 'download NCM JSON XLSX', mode: 'lexical', topK: 3 } });
    const found = searchOutput.parse(search.structuredContent);
    assert.equal(found.evidence[0].provenance.sourceId, 'rfb-download-ncm');
    assert.ok(found.evidence.every(e => e.temporalStatus === 'unknown'));
    const explained = await client.callTool({ name: 'explain_rule', arguments: { id: found.evidence[0].id } });
    assert.equal(explainOutput.parse(explained.structuredContent).evidence?.id, found.evidence[0].id);
    for (const name of ['get_cfop', 'get_ncm']) {
      const code = name === 'get_cfop' ? '5102' : '09012100';
      const response = await client.callTool({ name, arguments: { code, date: '2026-11-14' } });
      const lookup = lookupSchema.parse(response.structuredContent);
      assert.equal(lookup.status, 'found');
      const record = expected.codes.find((c: {kind: string; code: string}) => c.kind === (name === 'get_cfop' ? 'cfop' : 'ncm') && c.code === code);
      assert.equal(lookup.records[0].description, record.description);
      assert.equal(lookup.records[0].provenance.checksum, record.provenance.checksum);
    }
    const stateSearches = [];
    for (const jurisdiction of ['SP', 'MG']) {
      const response = await client.callTool({ name: 'search_regulations', arguments: { query: jurisdiction === 'SP' ? 'codificadas Código Fiscal Operações Prestações' : 'substituição tributária', jurisdiction, mode: 'lexical', topK: 3 } });
      const data = searchOutput.parse(response.structuredContent);
      assert.ok(data.evidence.some(e => e.provenance.jurisdiction === jurisdiction));
      stateSearches.push({ jurisdiction, ids: data.evidence.map(e => e.id) });
    }
    const absent = await client.callTool({ name: 'get_ncm', arguments: { code: '12345678' } });
    assert.equal(lookupSchema.parse(absent.structuredContent).status, 'not-found');
    const invalid = await client.callTool({ name: 'get_cfop', arguments: { code: '510' } });
    assert.equal(invalid.isError, true);
    observations.push({ mode, era: client.getProtocolEra(), tools: tools.map(t => t.name),
      searchIds: found.evidence.map(e => e.id), sourceUrls: found.evidence.map(e => e.provenance.sourceUrl),
      status: 'passed', populatedCodeTables: true, stateSearches, temporalStatus: 'unknown' });
  } finally { await client.close(); }
}
const output = process.argv[3] ?? '.data/aws/remote-smoke.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ testedAt: new Date().toISOString(), endpoint, observations,
  warning: 'Official MCP client over HTTPS. This is not an in-product ChatGPT Work test.' }, null, 2) + '\n');
console.log(JSON.stringify({ endpoint, status: 'passed', output }));
