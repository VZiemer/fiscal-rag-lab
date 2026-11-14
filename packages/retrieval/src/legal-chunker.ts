import { assertProvenance, type Evidence, type Provenance } from '../../corpus/src/evidence.js';

export interface LegalDocument { id: string; text: string; provenance: Provenance }
interface Unit { id: string; text: string; article: string | null; parentId: string | null; relatedIds: string[] }

/** Keep legal units intact first; split oversized units without discarding hierarchy or exception links. */
export function chunkLegalDocument(document: LegalDocument, maxChars = 1600): Evidence[] {
  assertProvenance(document.provenance);
  if (!document.id.trim() || !document.text.trim()) throw new Error('Document id and text required');
  if (!Number.isSafeInteger(maxChars) || maxChars < 64) throw new Error('maxChars must be an integer >= 64');
  const units: Unit[] = [];
  let article: Unit | undefined;
  let current: Unit | undefined;
  for (const line of document.text.replaceAll('\r\n', '\n').split('\n').map(s => s.trim()).filter(Boolean)) {
    const articleMatch = /^(?:\(\d+\)\s*)?(?:Art\.?|Artigo)\s*(\d+[º°o]?(?:-[A-Z])?)\s*[.\-–:]?/i.exec(line);
    const subordinate = /^(?:\(\d+\)\s*)?(?:§\s*\d+[º°o]?|Parágrafo único|[IVXLCDM]+\s*[-–]|[a-z]\))/i.test(line);
    const exception = /\b(?:exceto|salvo|ressalvad[oa]s?|não se aplica|exceç(?:ão|ões))\b/i.test(line);
    if (articleMatch || subordinate || exception || !current) {
      const id = `${document.id}:unit:${units.length + 1}`;
      current = { id, text: line, article: articleMatch ? articleMatch[1] : article?.article ?? null,
        parentId: articleMatch ? null : article?.id ?? null,
        relatedIds: exception && article ? [article.id] : [] };
      units.push(current);
      if (articleMatch) article = current;
      if (exception && article && article !== current) article.relatedIds.push(id);
    } else current.text += `\n${line}`;
  }
  const fragments = new Map<string, string[]>();
  const chunks: Evidence[] = [];
  for (const unit of units) {
    const texts: string[] = [];
    let remaining = unit.text;
    while (remaining.length > maxChars) {
      let split = remaining.lastIndexOf(' ', maxChars);
      if (split < maxChars / 2) split = maxChars;
      texts.push(remaining.slice(0, split));
      remaining = remaining.slice(split).trimStart();
    }
    if (remaining) texts.push(remaining);
    const ids = texts.map((_, i) => `${unit.id}:part:${i + 1}`);
    fragments.set(unit.id, ids);
    texts.forEach((text, i) => chunks.push({ ...unit, id: ids[i], text, documentId: document.id,
      provenance: structuredClone(document.provenance) }));
  }
  for (const chunk of chunks) {
    const unitId = chunk.id.slice(0, chunk.id.lastIndexOf(':part:'));
    // Sibling fragments are linked so a long exception can be reconstructed without guessing.
    chunk.relatedIds = [...new Set([...chunk.relatedIds.flatMap(id => fragments.get(id) ?? []),
      ...(fragments.get(unitId) ?? []).filter(id => id !== chunk.id)])];
    if (chunk.parentId) chunk.parentId = fragments.get(chunk.parentId)?.[0] ?? null;
  }
  return chunks;
}
