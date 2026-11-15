import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';

type Box = [number, number, number, number];
type Point = [number, number];
interface Element {
  id: string; kind: 'person' | 'softwareSystem' | 'container' | 'component' | 'code';
  name: string; technology: string; description: string[]; parent?: string; style?: 'storage' | 'port' | 'optional';
}
interface Relationship { id: string; from: string; to: string; label: string; technology?: string; optional?: boolean; implements?: boolean }
interface View {
  key: string; level: string; title: string; subtitle: string; height: number; note: string;
  nodes: { id: string; box: Box }[];
  edges: { id: string; points: Point[]; labelAt: Point; lines: string[] }[];
  boundaries?: { label: string; box: Box }[];
}
interface Model { name: string; elements: Element[]; relationships: Relationship[]; views: View[] }
const directory = 'docs/c4';
const model = JSON.parse(await readFile(`${directory}/model.json`, 'utf8')) as Model;
const elements = new Map(model.elements.map(element => [element.id, element]));
const relationships = new Map(model.relationships.map(relationship => [relationship.id, relationship]));
if (elements.size !== model.elements.length || relationships.size !== model.relationships.length) throw new Error('Duplicate C4 identifiers');
for (const e of model.elements) if (e.parent && !elements.has(e.parent)) throw new Error(`Missing parent: ${e.id}`);
for (const r of model.relationships) if (!elements.has(r.from) || !elements.has(r.to)) throw new Error(`Missing relationship endpoint: ${r.id}`);

const xml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const text = (x: number, y: number, value: string, size: number, fill = '#17324d', weight = 400, anchor = 'start') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}">${xml(value)}</text>`;
const font = 'Segoe UI';
const widths = new Map<string, number>();
async function measure(value: string, size: number): Promise<number> {
  const key = `${size}:${value}`;
  if (!widths.has(key)) {
    const result = await sharp({ text: { text: xml(value), font: `${font} ${size}`, rgba: true } }).metadata();
    widths.set(key, result.width ?? 0);
  }
  return widths.get(key)!;
}
async function fit(value: string, maxWidth: number, desired: number): Promise<number> {
  for (let size = desired; size >= 16; size--) if (await measure(value, size) <= maxWidth) return size;
  throw new Error(`Diagram text is too wide: ${value}`);
}
function palette(e: Element): { fill: string; stroke: string; text: string; muted: string } {
  if (e.style === 'storage') return { fill: '#e2f3f1', stroke: '#16766e', text: '#124942', muted: '#286e66' };
  if (e.style === 'port') return { fill: '#edf5ff', stroke: '#2570ac', text: '#153c62', muted: '#326286' };
  if (e.style === 'optional') return { fill: '#fff4df', stroke: '#b5812a', text: '#674a15', muted: '#7d632e' };
  if (e.id === 'fiscal' || e.parent || e.kind === 'code') return { fill: '#184e78', stroke: '#123b5b', text: '#ffffff', muted: '#c7e0f2' };
  return { fill: '#e8edf3', stroke: '#96a5b5', text: '#263c50', muted: '#506579' };
}
async function card(e: Element, [x, y, w, h]: Box): Promise<string> {
  const colors = palette(e);
  const titleSize = await fit(e.name, w - 48, 27);
  const techSize = await fit(e.technology, w - 48, 19);
  const bodySize = Math.min(...await Promise.all(e.description.map(line => fit(line, w - 48, 21))));
  if (112 + (e.description.length - 1) * 27 > h - 16) throw new Error(`Diagram text is too tall: ${e.id}`);
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${colors.fill}" stroke="${colors.stroke}" stroke-width="2"${e.style === 'port' ? ' stroke-dasharray="8 5"' : ''}/>`
    + text(x + 24, y + 40, e.name, titleSize, colors.text, 600)
    + text(x + 24, y + 70, e.technology, techSize, colors.muted)
    + e.description.map((line, index) => text(x + 24, y + 112 + index * 27, line, bodySize, colors.text)).join('') + '</g>';
}
function boundary(label: string, [x, y, w, h]: Box): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#edf2f8" stroke="#9baec0" stroke-width="2" stroke-dasharray="10 7"/>`
    + text(x + 22, y + 34, label, 20, '#516b83', 600);
}
async function render(view: View): Promise<string> {
  const present = new Set(view.nodes.map(n => n.id));
  let connections = '', labels = '';
  for (const edge of view.edges) {
    const r = relationships.get(edge.id);
    if (!r || !present.has(r.from) || !present.has(r.to)) throw new Error(`Invalid view relationship: ${edge.id}`);
    if (edge.points.length < 2) throw new Error(`Missing route: ${edge.id}`);
    const dashed = r.optional || r.implements;
    connections += `<polyline points="${edge.points.map(p => p.join(',')).join(' ')}" fill="none" stroke="#54728c" stroke-width="2.5" stroke-linejoin="round"${dashed ? ' stroke-dasharray="8 6"' : ''} marker-end="url(#${r.implements ? 'implements' : 'arrow'})"/>`;
    const [x, y] = edge.labelAt;
    const width = Math.max(...await Promise.all(edge.lines.map(line => measure(line, 20)))) + 20;
    labels += `<rect x="${x - width / 2}" y="${y - 20}" width="${width}" height="${edge.lines.length * 25 + 7}" rx="6" fill="#f8fafc"/>`
      + edge.lines.map((line, i) => text(x, y + i * 25, line, 20, '#34536c', 500, 'middle')).join('');
  }
  const cards = [];
  for (const node of view.nodes) {
    const e = elements.get(node.id);
    if (!e) throw new Error(`Unknown element: ${node.id}`);
    const [x, y, w, h] = node.box;
    if (x < 0 || y < 150 || x + w > 1600 || y + h > view.height - 75) throw new Error(`Card outside diagram: ${node.id}`);
    cards.push(await card(e, node.box));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${view.height}" viewBox="0 0 1600 ${view.height}">
<defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8 Z" fill="#54728c"/></marker><marker id="implements" markerWidth="12" markerHeight="10" refX="11" refY="5" orient="auto"><path d="M1,1 L11,5 L1,9 Z" fill="#f8fafc" stroke="#54728c"/></marker></defs>
<rect width="1600" height="${view.height}" fill="#f8fafc"/>
<g font-family="${font}, Arial, sans-serif">
${text(58, 40, `${view.level}  /  FISCAL RAG LAB`, 18, '#237c88', 700)}
${text(58, 88, view.title, 38, '#133653', 650)}
${text(58, 126, view.subtitle, 22, '#536b80')}
${(view.boundaries ?? []).map(b => boundary(b.label, b.box)).join('')}
${connections}${cards.join('')}${labels}
<line x1="58" y1="${view.height - 65}" x2="1542" y2="${view.height - 65}" stroke="#c9d6e2"/>
${text(58, view.height - 30, view.note, 20, '#536b80')}
</g></svg>`;
}

// One model produces the PNG views and the Structurizr description; layout never changes runtime behavior.
function dsl(): string {
  const quote = (value: string) => JSON.stringify(value);
  const lines = [`workspace ${quote(model.name)} "Arquitetura do código implementado; detalhes em docs/c4/README.md" {`, '    !impliedRelationships false', '    model {'];
  const emit = (e: Element, depth: number): void => {
    const indent = '    '.repeat(depth);
    const children = model.elements.filter(child => child.parent === e.id);
    const technology = e.kind === 'container' || e.kind === 'component' ? ` ${quote(e.technology)}` : '';
    lines.push(`${indent}${e.id} = ${e.kind} ${quote(e.name)} ${quote(e.description.join(' '))}${technology}${children.length ? ' {' : ''}`);
    for (const child of children) emit(child, depth + 1);
    if (children.length) lines.push(`${indent}}`);
  };
  for (const e of model.elements.filter(e => !e.parent && e.kind !== 'code')) emit(e, 2);
  for (const r of model.relationships) {
    if (elements.get(r.from)!.kind === 'code' || elements.get(r.to)!.kind === 'code') continue;
    lines.push(`        ${r.from} -> ${r.to} ${quote(r.label)}${r.technology ? ` ${quote(r.technology)}` : ''}`);
  }
  lines.push('    }', '    views {');
  for (const [index, view] of model.views.slice(0, 3).entries()) {
    const scope = index === 0 ? 'systemContext fiscal' : index === 1 ? 'container fiscal' : 'component runtime';
    lines.push(`        ${scope} ${quote(view.key)} {`, `            include ${view.nodes.map(n => n.id).join(' ')}`, '            autoLayout lr', '        }');
  }
  lines.push('        styles {');
  for (const [tag, color] of [['Person', '#506579'], ['Software System', '#184e78'], ['Container', '#184e78'], ['Component', '#2570ac']]) {
    lines.push(`            element ${quote(tag)} {`, `                background ${color}`, '                color #ffffff', ...(tag === 'Person' ? ['                shape Person'] : []), '            }');
  }
  lines.push('        }', '    }', '}', '');
  return lines.join('\n');
}

await mkdir(`${directory}/images`, { recursive: true });
for (const view of model.views) {
  const svg = await render(view);
  await writeFile(`${directory}/images/${view.key}.svg`, svg);
  await sharp(Buffer.from(svg)).png().toFile(`${directory}/images/${view.key}.png`);
  console.log(JSON.stringify({ view: view.key, width: 1600, height: view.height }));
}
await writeFile(`${directory}/workspace.dsl`, dsl());
