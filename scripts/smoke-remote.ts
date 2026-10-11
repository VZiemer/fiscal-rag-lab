import assert from 'node:assert/strict';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { lookupSchema, searchOutput, explainOutput } from '../apps/mcp-server/src/contracts.js';

const endpoint = process.argv[2];
if (!endpoint) throw new Error('Uso: npm run smoke:remote -- https://dominio/mcp [relatorio.json]');
const url = new URL(endpoint);
if (url.protocol !== 'https:' || url.username || url.password) throw new Error('HTTPS endpoint without credentials required');
const observations: unknown[] = [];
for (const path of ['/', '/privacy', '/health']) {
  const response = await fetch(new URL(path, url), { signal: AbortSignal.timeout(30_000) });
  assert.equal(response.status, 200, path);
  observations.push({ path, status: response.status });
}
for (const mode of ['legacy', 'auto'] as const) {
  const client = new Client({ name: 'fiscal-remote-smoke', version: '1' }, { versionNegotiation: { mode } });
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    const tools = (await client.listTools()).tools;
    assert.equal(tools.length, 4);
    const search = await client.callTool({ name: 'search_regulations', arguments: { query: 'Quais formatos de download NCM existem?', topK: 3 } });
    const found = searchOutput.parse(search.structuredContent);
    assert.equal(found.evidence[0].id, 'ncm-formats');
    assert.ok(found.evidence.every(e => e.temporalStatus === 'unknown'));
    const explained = await client.callTool({ name: 'explain_rule', arguments: { id: found.evidence[0].id } });
    assert.equal(explainOutput.parse(explained.structuredContent).evidence?.id, 'ncm-formats');
    for (const name of ['get_cfop', 'get_ncm']) {
      const response = await client.callTool({ name, arguments: { code: name === 'get_cfop' ? '5102' : '12345678' } });
      assert.equal(lookupSchema.parse(response.structuredContent).status, 'not-found');
    }
    const invalid = await client.callTool({ name: 'get_cfop', arguments: { code: '510' } });
    assert.equal(invalid.isError, true);
    observations.push({ mode, era: client.getProtocolEra(), tools: tools.map(t => t.name),
      searchIds: found.evidence.map(e => e.id), sourceUrls: found.evidence.map(e => e.provenance.sourceUrl),
      status: 'passed', emptyCodeTables: true, temporalStatus: 'unknown' });
  } finally { await client.close(); }
}
const output = process.argv[3] ?? '.data/aws/remote-smoke.json';
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ testedAt: new Date().toISOString(), endpoint, observations,
  warning: 'Official MCP client over HTTPS. This is not an in-product ChatGPT Work test.' }, null, 2) + '\n');
console.log(JSON.stringify({ endpoint, status: 'passed', output }));
