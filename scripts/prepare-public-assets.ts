import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

export interface PublicContact { name: string; email: string; site: string }
const escapeHtml = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
export function renderContact(template: string, contact: PublicContact, html: boolean): string {
  if (!contact.name?.trim() || /[\r\n]/.test(contact.name) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) throw new Error('Invalid public contact');
  const url = new URL(contact.site);
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Public site requires HTTPS');
  const values = { OPERATOR_NAME: contact.name, OPERATOR_EMAIL: contact.email, OPERATOR_SITE: contact.site };
  let rendered = template;
  for (const [key, value] of Object.entries(values)) rendered = rendered.replaceAll(`{{${key}}}`, html ? escapeHtml(value) : value);
  if (/\{\{OPERATOR_/.test(rendered)) throw new Error('Unresolved public contact field');
  return rendered;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const contact: PublicContact = JSON.parse(await readFile(process.argv[2] ?? '.data/aws/contact.json', 'utf8'));
  const output = process.argv[3] ?? '.data/aws/public';
  await mkdir(output, { recursive: true });
  for (const [name, html] of [['index.html', true], ['privacy.txt', false]] as const) {
    const template = await readFile(join('deploy/aws/public', name), 'utf8');
    await writeFile(join(output, name), renderContact(template, contact, html));
  }
  console.log('Public assets rendered with operator contact; personal contact stays outside Git.');
}
