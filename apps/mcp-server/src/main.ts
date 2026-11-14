import { createMcpHttpServer } from './server.js';
import { loadServices } from './runtime.js';

const port = Number(process.env.MCP_PORT ?? '3000');
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) throw new Error('Invalid MCP_PORT');
const file = process.env.MCP_CORPUS ?? (process.argv.includes('--demo') ? 'test/fixtures/demo-corpus.json' : '.data/corpus.json');
const services = await loadServices(file, {
  provider: process.env.EMBEDDING_PROVIDER ?? 'hash', model: process.env.EMBEDDING_MODEL ?? 'lexical-fnv1a-v1',
  dimensions: Number(process.env.EMBEDDING_DIMENSIONS ?? '128'), url: process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434'
});
const runtime = createMcpHttpServer(services, {
  allowedHosts: (process.env.MCP_ALLOWED_HOSTS ?? 'localhost,127.0.0.1,[::1]').split(','),
  allowedOrigins: (process.env.MCP_ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)
});
runtime.server.listen(port, process.env.MCP_HOST ?? '127.0.0.1', () => console.log(JSON.stringify({ event: 'listening', port, readOnly: true })));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => { void runtime.close(); });
