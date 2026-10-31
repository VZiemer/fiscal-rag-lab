import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function sources(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(e => e.isDirectory() ? sources(join(directory, e.name)) : e.name.endsWith('.ts') ? [join(directory, e.name)] : []));
  return lists.flat();
}
const violations: string[] = [];
const domainDirectories = ['packages/vector-core/', 'packages/retrieval/', 'packages/fiscal-domain/', 'packages/corpus/'];
for (const directory of ['packages', 'apps', 'scripts']) {
  for (const file of await sources(directory)) {
    const normalized = file.replaceAll('\\', '/');
    const text = await readFile(file, 'utf8');
    for (const match of text.matchAll(/(?:from\s*|import\s*(?:\(\s*)?|require\s*\(\s*)(['"])([^'"]+)\1/g)) {
      const dependency = match[2];
      if (domainDirectories.some(prefix => normalized.startsWith(prefix)) &&
          /@modelcontextprotocol|openai|exceljs|ollama|\/apps\/|node:|\badapters\b/.test(dependency)) violations.push(`${file}: ${dependency}`);
      if (/^zod(?:\/|$)/.test(dependency) && normalized !== 'packages/validation/src/schema.ts') violations.push(`${file}: Zod must stay in the validation facade`);
      if (normalized.startsWith('packages/validation/') && /@modelcontextprotocol/.test(dependency)) violations.push(`${file}: MCP must stay in its adapter`);
    }
  }
}
if (violations.length) throw new Error(`Forbidden dependencies across ports/adapters:\n${violations.join('\n')}`);
console.log('Domain boundaries verified; Zod is isolated in the validation facade and MCP stays outside it.');
