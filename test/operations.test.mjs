import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from 'node:http';
import { FixedWindowLimiter } from '../dist/apps/mcp-server/src/operations.js';
import { createMcpHttpServer } from '../dist/apps/mcp-server/src/server.js';
import { loadServices } from '../dist/apps/mcp-server/src/runtime.js';
test('bounded fixed windows reset quotas and expire clients', () => {
  const limiter = new FixedWindowLimiter(2, 100, 1);
  assert.equal(limiter.allow('a', 0), true);
  assert.equal(limiter.allow('a', 1), true);
  assert.equal(limiter.allow('a', 2), false);
  assert.equal(limiter.allow('b', 3), false);
  assert.equal(limiter.allow('b', 100), true);
  assert.throws(() => new FixedWindowLimiter(0));
});
test('HTTP enforces quotas/body/host and logs metadata without queries or identifiers', async () => {
  const logs = [];
  const runtime = createMcpHttpServer(await loadServices('test/fixtures/demo-corpus.json'), { requestsPerMinute: 2, log: e => logs.push(e) });
  await new Promise(resolve => runtime.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${runtime.server.address().port}`;
  try {
    assert.equal((await fetch(`${base}/health`)).status, 200);
    assert.match(await (await fetch(`${base}/privacy`)).text(), /não são armazenados/);
    const headers = { 'content-type': 'application/json', accept: 'application/json, text/event-stream' };
    assert.equal((await fetch(`${base}/mcp`, { method: 'POST', headers, body: 'x'.repeat(65537) })).status, 413);
    await fetch(`${base}/mcp`, { method: 'POST', headers, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'search_regulations', arguments: { query: 'PRIVATE_QUERY_123' } } }) });
    const denied = await fetch(`${base}/mcp`, { method: 'POST', headers: { ...headers, 'x-forwarded-for': 'spoofed' }, body: '{}' });
    assert.equal(denied.status, 429);
    assert.equal(denied.headers.get('retry-after'), '60');
    const hostStatus = await new Promise((resolve, reject) => {
      const req = request(`${base}/health`, { headers: { host: 'evil.example' } }, res => { res.resume(); resolve(res.statusCode); });
      req.on('error', reject); req.end();
    });
    assert.equal(hostStatus, 403);
    await fetch(`${base}/unknown?secret=PRIVATE_QUERY_123`);
    assert.doesNotMatch(JSON.stringify(logs), /PRIVATE_QUERY|spoofed|127\.0\.0\.1|secret/);
    assert.ok(logs.every(e => Object.keys(e).sort().join(',') === 'durationMs,requestId,route,status'));
  } finally { await runtime.close(); }
});
