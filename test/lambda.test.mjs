import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { handler } from '../dist/apps/mcp-server/src/lambda.js';

test('Lambda HTTP v2 adapter protects origin and serves modern/legacy MCP with sanitized logs', async () => {
  const previousSecret = process.env.ORIGIN_SECRET, previousCorpus = process.env.MCP_CORPUS;
  process.env.ORIGIN_SECRET = 'unit-test-origin-secret-01234567890123456789';
  process.env.MCP_CORPUS = 'test/fixtures/demo-corpus.json';
  const event = { rawPath: '/mcp', headers: {}, requestContext: { http: { method: 'POST', sourceIp: 'unit-test-ip' } } };
  try {
    assert.equal((await handler(event)).statusCode, 403);
    const health = await handler({ ...event, rawPath: '/health', headers: { 'x-fiscal-origin': process.env.ORIGIN_SECRET }, requestContext: { http: { method: 'GET', sourceIp: 'unit-test-ip' } } });
    assert.equal(health.statusCode, 200);
    const stats = JSON.parse(health.body).corpus;
    assert.ok(stats.evidence > 0 && stats.cfop > 0 && stats.ncm > 0);
    assert.match(stats.checksum, /^[a-f0-9]{64}$/);
    for (const mode of ['legacy', 'auto']) {
      const client = new Client({ name: 'lambda-contract', version: '1' }, { versionNegotiation: { mode } });
      const transport = new StreamableHTTPClientTransport(new URL('https://fiscal.test/mcp'), { fetch: async (url, init) => {
        const request = new Request(url, init);
        const result = await handler({ ...event, headers: { ...Object.fromEntries(request.headers), 'x-fiscal-origin': process.env.ORIGIN_SECRET },
          body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
          requestContext: { http: { method: request.method, sourceIp: 'unit-test-ip' } } });
        return new Response(result.body || null, { status: result.statusCode, headers: result.headers });
      } });
      try {
        await client.connect(transport);
        assert.equal((await client.listTools()).tools.length, 4);
        const result = await client.callTool({ name: 'get_cfop', arguments: { code: '5102', date: '2026-11-14' } });
        assert.equal(result.structuredContent.status, 'found');
      } finally { await client.close(); }
    }
    const authorized = { ...event, headers: { 'x-fiscal-origin': process.env.ORIGIN_SECRET } };
    assert.equal((await handler({ ...authorized, body: 'a'.repeat(65537) })).statusCode, 413);
    assert.equal((await handler({ ...authorized, body: '{"method":"subscriptions/listen"}' })).statusCode, 400);
    assert.equal((await handler({ ...authorized, headers: { ...authorized.headers, origin: 'https://evil.example' } })).statusCode, 403);
  } finally {
    if (previousSecret === undefined) delete process.env.ORIGIN_SECRET; else process.env.ORIGIN_SECRET = previousSecret;
    if (previousCorpus === undefined) delete process.env.MCP_CORPUS; else process.env.MCP_CORPUS = previousCorpus;
  }
});
