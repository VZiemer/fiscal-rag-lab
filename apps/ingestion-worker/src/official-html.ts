import { load } from 'cheerio';
import iconv from 'iconv-lite';
import type { Evidence, Provenance } from '../../../packages/corpus/src/evidence.js';
import { chunkLegalDocument } from '../../../packages/retrieval/src/legal-chunker.js';

export type HtmlProfile = 'rfb' | 'sp-books' | 'sp-annexes' | 'sp' | 'mg' | 'confaz';

export function decodeOfficialHtml(bytes: Uint8Array, contentType: string): string {
  // MG declares a UTF-8 page shell but embeds Windows-1252 legal text. Honor HTTP encoding.
  const charset = /charset\s*=\s*["']?([^\s;"']+)/i.exec(contentType)?.[1] ?? 'utf-8';
  const text = /^(?:iso-8859-1|windows-1252)$/i.test(charset)
    ? iconv.decode(Buffer.from(bytes), 'windows-1252') : new TextDecoder(charset, { fatal: true }).decode(bytes);
  if (text.includes('\ufffd')) throw new Error('HTML decoding lost characters');
  return text;
}

export function extractOfficialHtml(html: string, profile: HtmlProfile, id: string, provenance: Provenance): Evidence[] {
  return inspectOfficialHtml(html, profile, id, provenance).evidence;
}

export function inspectOfficialHtml(html: string, profile: HtmlProfile, id: string, provenance: Provenance): { evidence: Evidence[]; omittedSections: number } {
  const $ = load(html);
  const selector = profile === 'rfb' ? '#parent-fieldname-text' : profile.startsWith('sp')
    ? '[id$="ControlWrapper_RichHtmlField"]' : profile === 'mg' ? '#conteudo .WordSection1' : '#parent-fieldname-text';
  const content = $(selector).last().clone();
  if (content.length !== 1) throw new Error(`Missing official content selector: ${profile}`);
  content.find('script,style,title,iframe,nav,form,.revogado,.sefazElement-TextoRevogado,del,s,strike,[style*="line-through" i]').remove();
  content.find('br').replaceWith('\n');
  const blocks: string[] = [];
  content.find('p,h1,h2,h3,h4,h5,h6,li,td,th').each((_, element) => {
    const node = $(element);
    // Prefer semantic paragraphs. Leaf cells retain tabular text absent from paragraphs.
    if (node.find('p,h1,h2,h3,h4,h5,h6,li,td,th').length) return;
    const text = node.text().replace(/[\u200b-\u200f\ufeff]/g, '').replace(/\s+/g, ' ').trim();
    if (text) blocks.push(text);
  });
  let selected = blocks;
  if (profile === 'sp-books') {
    const start = blocks.findIndex(t => /^LIVRO I\s*[-–]/i.test(t));
    const end = blocks.findIndex((t, index) => index > start && /^ANEXO I\s*[-–]/i.test(t));
    if (start < 0 || end < 0) throw new Error('SP book boundaries not found');
    selected = blocks.slice(start, end);
  } else if (profile === 'sp-annexes') {
    const start = blocks.findIndex(t => /^ANEXO I\s*[-–]/i.test(t));
    const end = blocks.findIndex((t, index) => index > start && /^ANEXO IV\s*[-–]/i.test(t));
    if (start < 0 || end < 0) throw new Error('SP annex boundaries not found');
    selected = blocks.slice(start, end);
  }
  if (!selected.length) throw new Error('Empty official document');
  // Bound each section before legal chunking: large annex tables otherwise generate quadratic sibling links.
  const sections: string[][] = [[]];
  let length = 0;
  for (const text of selected) {
    if (length > 24_000 || /^(?:(?:\(\d+\)\s*)?(?:Art\.?|Artigo)\s*\d|(?:ANEXO|LIVRO|TÍTULO|CAPÍTULO|SEÇÃO|SUBSEÇÃO|PARTE|TABELA)\s+[IVX\d])/i.test(text)) {
      if (sections.at(-1)!.length) sections.push([]);
      length = 0;
    }
    sections.at(-1)!.push(text); length += text.length;
  }
  let omittedSections = 0;
  const evidence = sections.flatMap((s, index) => {
    if (s.some(text => /[\u0080-\u009f\ufffd]/.test(text))) { omittedSections++; return []; }
    return s.length ? chunkLegalDocument({
    id: `${id}:section:${index + 1}`, text: s.join('\n'), provenance
    }) : [];
  });
  if (!evidence.length) throw new Error('No uncorrupted sections in official document');
  return { evidence, omittedSections };
}
