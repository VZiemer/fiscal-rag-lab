import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { createMcpHttpServer } from '../dist/apps/mcp-server/src/server.js';
import { loadServices } from '../dist/apps/mcp-server/src/runtime.js';
import { lookupSchema, searchOutput, explainOutput } from '../dist/apps/mcp-server/src/contracts.js';

for (const era of ['legacy', 'auto']) test(`MCP ${era}: independent official client negotiates and calls all read-only tools`, async () => {
  const services = await loadServices('test/fixtures/demo-corpus.json');
  const runtime = createMcpHttpServer(services);
  await new Promise(resolve => runtime.server.listen(0, '127.0.0.1', resolve));
  const url = new URL(`http://127.0.0.1:${runtime.server.address().port}/mcp`);
  const client = new Client({ name: 'contract-test', version: '1' }, { versionNegotiation: { mode: era } });
  try {
    await client.connect(new StreamableHTTPClientTransport(url));
    const tools = (await client.listTools()).tools;
    assert.deepEqual(tools.map(t => t.name).sort(), ['explain_rule', 'get_cfop', 'get_ncm', 'search_regulations']);
    assert.ok(tools.every(t => t.annotations.readOnlyHint && !t.annotations.destructiveHint && t.outputSchema));
    const searchContract = tools.find(t => t.name === 'search_regulations');
    assert.equal(searchContract.inputSchema.additionalProperties, false);
    assert.equal(searchContract.inputSchema.properties.topK.maximum, 50);
    assert.deepEqual(searchContract.inputSchema.required, ['query']);
    if (era === 'auto') assert.equal(client.getProtocolEra(), 'modern');
    for (const name of ['get_cfop', 'get_ncm']) {
      const response = await client.callTool({ name, arguments: { code: name === 'get_cfop' ? '5102' : '1234.56.78', date: '2026-11-14' } });
      assert.ok(!response.isError); lookupSchema.parse(response.structuredContent);
      assert.equal(response.structuredContent.status, 'found');
      assert.deepEqual(JSON.parse(response.content[0].text), response.structuredContent);
    }
    const result = await client.callTool({ name: 'search_regulations', arguments: { query: 'devolução', date: '2026-11-14' } });
    searchOutput.parse(result.structuredContent); assert.ok(result.structuredContent.evidence.length);
    const explained = await client.callTool({ name: 'explain_rule', arguments: { id: 'demo:art1' } });
    explainOutput.parse(explained.structuredContent); assert.equal(explained.structuredContent.relatedEvidence[0].id, 'demo:exception');
    const old = await client.callTool({ name: 'explain_rule', arguments: { id: 'demo:art1', date: '2020-01-01' } });
    assert.equal(old.structuredContent.evidence, null);
    for (const args of [{ code: '510' }, { code: '5102', extra: 'reject' }, { code: '5102', date: '2026-02-30' }]) {
      const invalid = await client.callTool({ name: 'get_cfop', arguments: args }); assert.equal(invalid.isError, true);
    }
    for (const args of [{ query: ' ' }, { query: 'x', topK: 51 }, { query: 'x', topK: '5' }, { query: 'x', date: '2026-02-30' }]) {
      const invalid = await client.callTool({ name: 'search_regulations', arguments: args }); assert.equal(invalid.isError, true);
    }
    const badBody = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: '{' });
    assert.ok(badBody.status >= 400);
    const rejected = await fetch(url, { method: 'POST', headers: { origin: 'https://evil.example' } });
    assert.equal(rejected.status, 403);
  } finally { await client.close(); await runtime.close(); }
});
test('MCP sanitizes domain/provider failures without leaking paths or secrets', async () => {
  const services = await loadServices('test/fixtures/demo-corpus.json');
  const runtime = createMcpHttpServer({ ...services, retriever: { search: async () => { throw new Error('SECRET /private/path'); } } });
  await new Promise(resolve => runtime.server.listen(0, '127.0.0.1', resolve));
  const client = new Client({ name: 'error-test', version: '1' });
  try {
    await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${runtime.server.address().port}/mcp`)));
    const result = await client.callTool({ name: 'search_regulations', arguments: { query: 'x' } });
    assert.equal(result.isError, true); assert.doesNotMatch(JSON.stringify(result), /SECRET|private/);
  } finally { await client.close(); await runtime.close(); }
});
