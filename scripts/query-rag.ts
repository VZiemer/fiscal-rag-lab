import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { z } from 'zod';
import { cfopInput, ncmInput, searchInput, explainInput, lookupSchema, searchOutput, explainOutput } from '../apps/mcp-server/src/contracts.js';

// This client is restricted to the project's RAG. Its use for fiscal answers requires user authorization under AGENTS.md.
const callSchema = z.discriminatedUnion('name', [
  z.object({ name: z.literal('get_cfop'), arguments: cfopInput }).strict(),
  z.object({ name: z.literal('get_ncm'), arguments: ncmInput }).strict(),
  z.object({ name: z.literal('search_regulations'), arguments: searchInput }).strict(),
  z.object({ name: z.literal('explain_rule'), arguments: explainInput }).strict()
]);
const [planFile, output = '.data/rag-query-results.json'] = process.argv.slice(2);
if (!planFile) throw new Error('Uso: node dist/scripts/query-rag.js plano.json [resultado.json]');
const plan = z.object({ calls: z.array(callSchema).min(1).max(20) }).strict().parse(JSON.parse(await readFile(planFile, 'utf8')));
const endpoint = 'https://d2kvl1uo6lcsgz.cloudfront.net/mcp';
const client = new Client({ name: 'fiscal-rag-authorized-query', version: '1' }, { versionNegotiation: { mode: 'auto' } });
const results: { call: z.infer<typeof callSchema>; response: unknown }[] = [];
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  for (const call of plan.calls) {
    const response = await client.callTool(call);
    if (response.isError) throw new Error(`RAG tool failed: ${call.name}`);
    const schema = call.name === 'search_regulations' ? searchOutput : call.name === 'explain_rule' ? explainOutput : lookupSchema;
    results.push({ call, response: schema.parse(response.structuredContent) });
    console.log(JSON.stringify({ tool: call.name, status: 'received' }));
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ queriedAt: new Date().toISOString(), endpoint, results }, null, 2) + '\n');
  console.log(JSON.stringify({ output, calls: results.length, externalSources: false }));
} finally { await client.close(); }
