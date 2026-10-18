import assert from 'node:assert/strict';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const endpoint = 'https://d2kvl1uo6lcsgz.cloudfront.net/mcp';
const client = new Client({ name: 'fiscal-review-rehearsal', version: '1' }, { versionNegotiation: { mode: 'auto' } });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(endpoint)));
  const tools = (await client.listTools()).tools;
  assert.equal(tools.length, 4);
  assert.ok(tools.every(t => t.annotations?.readOnlyHint === true && t.annotations?.openWorldHint === false && t.annotations?.destructiveHint === false));
  const calls = [
    { name: 'search_regulations', arguments: { query: 'Quais formatos de download NCM existem?', topK: 5 } },
    { name: 'search_regulations', arguments: { query: 'O download NCM inclui códigos de períodos passados?', topK: 5 } },
    { name: 'get_cfop', arguments: { code: '5102' } },
    { name: 'get_ncm', arguments: { code: '1234.56.78' } },
    { name: 'explain_rule', arguments: { id: 'ncm-formats' } }
  ];
  const results = [];
  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    const response = await client.callTool(call);
    assert.ok(!response.isError);
    const data = response.structuredContent as Record<string, unknown>;
    if (i === 0 || i === 1) {
      const evidence = data.evidence as { id: string; temporalStatus: string }[];
      assert.ok(evidence.some(e => e.id === (i === 0 ? 'ncm-formats' : 'ncm-current')));
      assert.ok(evidence.every(e => e.temporalStatus === 'unknown'));
    } else if (i === 2 || i === 3) assert.equal(data.status, 'not-found');
    else assert.equal((data.evidence as { id: string }).id, 'ncm-formats');
    results.push({ case: i + 1, status: 'Passed', level: 'MCP tool contract only', call, response: data });
  }
  const output = process.argv[2] ?? '.data/review-rehearsal.json';
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ testedAt: new Date().toISOString(), endpoint, toolAnnotations: 'Passed',
    positiveToolContracts: results, workAgentBehavior: 'Not run: host connection unavailable',
    negativeAgentCases: 'Not run: requires real ChatGPT Work interaction',
    recording: 'Blocked: interface runtime failed before capture; no video produced' }, null, 2) + '\n');
  console.log(JSON.stringify({ positiveToolContracts: 5, passed: 5, workAgentCases: 'Not run', video: 'Not recorded', output }));
} finally { await client.close(); }
