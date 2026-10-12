import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderContact, type PublicContact } from './prepare-public-assets.js';

export function validatePublicEndpoint(endpoint: string): URL {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/mcp' ||
      ['localhost', '127.0.0.1', '[::1]', 'example.com', 'example.org'].includes(url.hostname) || url.hostname.endsWith('.invalid')) {
    throw new Error('Informe um endpoint público HTTPS real, sem credenciais ou query, terminando em /mcp');
  }
  return url;
}
export async function preparePlugin(endpoint: string, output = '.data/plugin-public', contact?: PublicContact): Promise<void> {
  const url = validatePublicEndpoint(endpoint);
  const source = 'plugins/fiscal-rag';
  const manifest = JSON.parse(await readFile(join(source, 'plugin.json'), 'utf8'));
  const mcp = JSON.parse(await readFile(join(source, 'mcp.json'), 'utf8'));
  const skill = await readFile(join(source, 'skills/fiscal-research/SKILL.md'), 'utf8');
  mcp.mcpServers.fiscal.url = url.href;
  if (contact) {
    renderContact('', contact, false);
    manifest.author = { name: contact.name, email: contact.email, url: contact.site };
    manifest.extensions['com.openai'].interface.developerName = contact.name;
  }
  for (const key of ['websiteURL', 'supportURL', 'privacyPolicyURL', 'termsOfServiceURL']) {
    const path = new URL(manifest.extensions['com.openai'].interface[key]).pathname;
    manifest.extensions['com.openai'].interface[key] = new URL(path, url.origin).href;
  }
  manifest.homepage = url.origin;
  await mkdir(join(output, 'skills/fiscal-research'), { recursive: true });
  await mkdir(join(output, 'assets'), { recursive: true });
  // Copy an explicit allowlist so future local credentials or downloaded data cannot enter the package.
  await writeFile(join(output, 'plugin.json'), JSON.stringify(manifest, null, 2) + '\n');
  await writeFile(join(output, 'mcp.json'), JSON.stringify(mcp, null, 2) + '\n');
  await writeFile(join(output, 'skills/fiscal-research/SKILL.md'), skill);
  for (const asset of ['icon.svg', 'icon-dark.svg']) await writeFile(join(output, 'assets', asset), await readFile(join(source, 'assets', asset)));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv[2]) throw new Error('Uso: npm run plugin:prepare -- https://seu-dominio/mcp [diretorio]');
  const contact = process.argv[4] ? JSON.parse(await readFile(process.argv[4], 'utf8')) as PublicContact : undefined;
  await preparePlugin(process.argv[2], process.argv[3], contact);
  console.log('Pacote preparado; conectividade, política pública e teste em ChatGPT Work ainda precisam de validação.');
}
