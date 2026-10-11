import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function sources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(e => e.isDirectory() ? sources(join(directory, e.name)) : e.name.endsWith('.ts') ? [join(directory, e.name)] : []));
  return lists.flat();
}
const violations: string[] = [];
for (const directory of ['packages/vector-core', 'packages/retrieval', 'packages/fiscal-domain', 'packages/corpus']) {
  for (const file of await sources(directory)) {
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s*|import\s*\()(['"])([^'"]+)\1/g)) {
      if (/@modelcontextprotocol|openai|exceljs|ollama|\/apps\/|node:|\badapters\b/.test(match[2])) violations.push(`${file}: ${match[2]}`);
    }
  }
}
if (violations.length) throw new Error(`Forbidden dependencies across ports/adapters:\n${violations.join('\n')}`);
console.log('Domain, corpus, retrieval and vector sources have no transport, filesystem or vendor imports.');
