import { createMcpHandler } from '@modelcontextprotocol/server';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import { buildMcpServer } from './server.js';
import { loadServices, type LoadedServices } from './runtime.js';
import { FixedWindowLimiter, privacyPolicy } from './operations.js';

interface HttpEvent {
  rawPath: string; rawQueryString?: string; headers: Record<string, string | undefined>; body?: string; isBase64Encoded?: boolean;
  requestContext: { http: { method: string; sourceIp: string }; requestId?: string };
}
const limiter = new FixedWindowLimiter(120);
let handlerPromise: Promise<{ mcp: ReturnType<typeof createMcpHandler>; stats: LoadedServices['stats'] }> | undefined;
const reply = (statusCode: number, body: string, contentType = 'application/json') => ({ statusCode,
  headers: { 'content-type': contentType, 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' }, body, isBase64Encoded: false });

/** API Gateway payload v2 adapter; domain and retrieval remain unaware of Lambda. */
export async function handler(event: HttpEvent) {
  const started = performance.now(), requestId = randomUUID();
  let status = 500;
  const route = event.rawPath === '/mcp' ? 'mcp' : event.rawPath === '/health' ? 'health' : event.rawPath === '/privacy' ? 'privacy' : 'other';
  try {
    const expected = process.env.ORIGIN_SECRET ?? '', supplied = event.headers['x-fiscal-origin'] ?? '';
    if (expected.length < 32 || expected.length !== supplied.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(supplied))) {
      status = 403; return reply(status, '{"error":"Forbidden"}');
    }
    if (route === 'privacy' && event.requestContext.http.method === 'GET') {
      status = 200; return reply(status, privacyPolicy, 'text/plain; charset=utf-8');
    }
    if (route !== 'mcp' && route !== 'health') { status = 404; return reply(status, '{"error":"Not found"}'); }
    handlerPromise ??= loadServices(process.env.MCP_CORPUS ?? '/var/task/corpus.json')
      .then(services => ({ mcp: createMcpHandler(() => buildMcpServer(services), { maxRequestBodySize: 64 * 1024 }), stats: services.stats }));
    const { mcp, stats } = await handlerPromise;
    if (route === 'health' && event.requestContext.http.method === 'GET') {
      status = 200; return reply(status, JSON.stringify({ status: 'ok', readOnly: true, corpus: stats, learnedEmbeddings: false }));
    }
    if (!limiter.allow(event.requestContext.http.sourceIp)) { status = 429; return { ...reply(status, '{"error":"Rate limited"}'), headers: { ...reply(status, '').headers, 'retry-after': '60' } }; }
    const method = event.requestContext.http.method;
    const body = event.body ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8') : undefined;
    if (body && body.byteLength > 64 * 1024) { status = 413; return reply(status, '{"error":"Body too large"}'); }
    const origin = event.headers.origin;
    if (origin && origin !== process.env.PUBLIC_ORIGIN) { status = 403; return reply(status, '{"error":"Forbidden origin"}'); }
    // This read-only deployment has no long-lived subscriptions; buffered Lambda responses remain bounded.
    if (method === 'POST' && body) {
      try {
        const parsed = JSON.parse(body.toString('utf8'));
        if (parsed?.method === 'subscriptions/listen') { status = 400; return reply(status, '{"jsonrpc":"2.0","id":null,"error":{"code":-32601,"message":"Subscriptions unavailable"}}'); }
      } catch { /* SDK owns JSON-RPC parse errors. */ }
    }
    const headers = new Headers();
    for (const [key, value] of Object.entries(event.headers)) if (value && !['host', 'content-length', 'x-fiscal-origin'].includes(key)) headers.set(key, value);
    const response = await mcp.fetch(new Request(`https://fiscal.internal${event.rawPath}`, { method, headers,
      ...(body && !['GET', 'HEAD'].includes(method) ? { body } : {}) }));
    status = response.status;
    return { ...reply(status, await response.text(), response.headers.get('content-type') ?? 'application/json'),
      headers: { ...Object.fromEntries(response.headers), 'cache-control': 'no-store', 'x-request-id': requestId } };
  } catch {
    handlerPromise = undefined;
    status = 503; return reply(status, '{"error":"Evidence service unavailable"}');
  } finally {
    console.log(JSON.stringify({ requestId, route, status, durationMs: Math.round((performance.now() - started) * 1000) / 1000 }));
  }
}
