import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createMcpHttpServer } from '../apps/mcp-server/src/server.js';
import { loadServices } from '../apps/mcp-server/src/runtime.js';

const runtime = createMcpHttpServer(await loadServices('test/fixtures/demo-corpus.json'));
await new Promise<void>(resolve => runtime.server.listen(0, '127.0.0.1', resolve));
const address = runtime.server.address();
if (!address || typeof address === 'string') throw new Error('Missing listening address');
const client = new Client({ name: 'fiscal-demo-recorder', version: '1' }, { versionNegotiation: { mode: 'auto' } });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`)));
  const calls = [
    { name: 'get_cfop', arguments: { code: '5102', date: '2026-11-14' } },
    { name: 'get_ncm', arguments: { code: '12345678', date: '2026-11-14' } },
    // Keep the query in the synthetic corpus language to exercise retrieval and exception links.
    { name: 'search_regulations', arguments: { query: 'devolução', date: '2026-11-14', jurisdiction: 'BR' } },
    { name: 'explain_rule', arguments: { id: 'demo:art1', date: '2026-11-14' } },
    { name: 'get_cfop', arguments: { code: '5102', date: '2020-01-01' } }
  ];
  const transcript = [];
  for (const call of calls) transcript.push({ request: call, response: await client.callTool(call) });
  const output = process.argv[2] ?? '.data/demo-transcript.json';
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ recordedAt: new Date().toISOString(), era: client.getProtocolEra(),
    warning: 'Local technical transcript using synthetic fixtures with no fiscal value. This is not a video or a test in ChatGPT Work.', transcript }, null, 2) + '\n');
  console.log(`Transcript of ${calls.length} calls saved to ${output}`);
} finally { await client.close(); await runtime.close(); }
