import ExcelJS from 'exceljs';
import { assertDate, assertProvenance, type Provenance } from '../../../packages/corpus/src/evidence.js';
import { normalizeCode, type FiscalCode } from '../../../packages/fiscal-domain/src/code-repository.js';

type Cell = string | number | Date | null;
const header = (value: Cell): string => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
function dateCell(value: Cell): string | null {
  if (value === null || value === '') return null;
  if (value instanceof Date) { const date = value.toISOString().slice(0, 10); assertDate(date); return date; }
  if (typeof value === 'number') throw new Error('Unformatted Excel date serial');
  let date = value;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) date = date.split('/').reverse().join('-');
  assertDate(date);
  return date;
}

/** Header mapping is explicit: schema drift fails closed instead of shifting fiscal fields. */
export function parseCfopRows(rows: Cell[][], provenance: Provenance): FiscalCode[] {
  assertProvenance(provenance);
  const aliases = {
    code: ['cfop', 'codigo'], title: ['titulo', 'titulodocfop', 'descricaocfop'],
    notes: ['descricao', 'descricaonotaexplicativa', 'notasexplicativas'], from: ['iniciovigencia', 'iniciodevigencia', 'datainiciovigencia'],
    to: ['fimvigencia', 'fimdevigencia', 'datafimvigencia']
  };
  const headerRow = rows.findIndex(row => row.some(c => header(c) === 'cfop') && row.some(c => aliases.title.includes(header(c))));
  if (headerRow < 0) throw new Error('Unsupported CFOP header: expected CFOP and Titulo');
  const columns = rows[headerRow].map(header);
  const column = (names: string[]) => {
    const matches = columns.map((c, i) => names.includes(c) ? i : -1).filter(i => i >= 0);
    if (matches.length > 1) throw new Error('Ambiguous CFOP columns');
    return matches[0] ?? -1;
  };
  const codeCol = column(aliases.code), titleCol = column(aliases.title), notesCol = column(aliases.notes);
  const fromCol = column(aliases.from), toCol = column(aliases.to);
  const seen = new Set<string>();
  const result: FiscalCode[] = [];
  for (const row of rows.slice(headerRow + 1)) {
    if (row.every(c => c === null || c === '')) continue;
    const code = normalizeCode('cfop', String(row[codeCol] ?? ''));
    const description = String(row[titleCol] ?? '').trim();
    if (!description) throw new Error(`Missing CFOP title: ${code}`);
    const p = { ...provenance, validFrom: fromCol < 0 ? provenance.validFrom : dateCell(row[fromCol] ?? null),
      validTo: toCol < 0 ? provenance.validTo : dateCell(row[toCol] ?? null) };
    assertProvenance(p);
    const key = `${code}:${p.validFrom}:${p.validTo}`;
    if (seen.has(key)) throw new Error('Duplicate CFOP row');
    seen.add(key);
    result.push({ kind: 'cfop', code, description, notes: notesCol < 0 ? null : String(row[notesCol] ?? '') || null, provenance: p });
  }
  if (!result.length) throw new Error('Empty CFOP table');
  return result;
}

export async function parseCfopXlsx(bytes: Uint8Array, provenance: Provenance): Promise<FiscalCode[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(bytes));
  const sheet = workbook.getWorksheet('CFOP');
  if (!sheet) throw new Error('Missing CFOP worksheet');
  const rows: Cell[][] = [];
  sheet.eachRow(row => {
    const cells: Cell[] = [];
    for (let i = 1; i <= row.cellCount; i++) {
      const value = row.getCell(i).value;
      if (value === null || value === undefined) cells.push(null);
      else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) cells.push(value);
      else if (typeof value === 'object' && 'richText' in value) cells.push(value.richText.map(t => t.text).join(''));
      else throw new Error('Formula or unsupported CFOP cell');
    }
    rows.push(cells);
  });
  return parseCfopRows(rows, provenance);
}

export function parseNcmJson(text: string, provenance: Provenance): FiscalCode[] {
  assertProvenance(provenance);
  const data = JSON.parse(text) as { Nomenclaturas?: Record<string, unknown>[] };
  if (!Array.isArray(data.Nomenclaturas)) throw new Error('Invalid Classif JSON');
  const records: FiscalCode[] = [];
  const seen = new Set<string>();
  const ancestors: { code: string; description: string }[] = [];
  for (const row of data.Nomenclaturas) {
    if (typeof row.Codigo !== 'string' || typeof row.Descricao !== 'string') throw new Error('Invalid NCM row');
    // Classif includes chapter and heading nodes; only eight-digit leaf codes are lookup entries.
    const digits = row.Codigo.replaceAll('.', '');
    if (/^\d{2,7}$/.test(digits) && /^(?:\d{2}|\d{2}\.\d{2}|\d{4}\.\d{1,2}(?:\.\d)?)$/.test(row.Codigo)) {
      while (ancestors.length && !digits.startsWith(ancestors.at(-1)!.code)) ancestors.pop();
      ancestors.push({ code: digits, description: row.Descricao });
      continue;
    }
    const code = normalizeCode('ncm', row.Codigo);
    if (!row.Descricao.trim() || seen.has(code)) throw new Error('Missing description or duplicate NCM');
    seen.add(code);
    while (ancestors.length && !code.startsWith(ancestors.at(-1)!.code)) ancestors.pop();
    // Classif's 9999 sentinel means no stated end, not a guarantee of future tax validity.
    const end = dateCell((row.Data_Fim ?? null) as Cell);
    const p = { ...provenance, validFrom: dateCell((row.Data_Inicio ?? null) as Cell), validTo: end === '9999-12-31' ? null : end };
    assertProvenance(p);
    const notes = ancestors.map(a => `${a.code}: ${a.description}`);
    if (row.Tipo_Ato_Ini && row.Numero_Ato_Ini && row.Ano_Ato_Ini) notes.push(`Ato de início informado na tabela: ${row.Tipo_Ato_Ini} ${row.Numero_Ato_Ini}/${row.Ano_Ato_Ini}.`);
    if (end === '9999-12-31') notes.push('Data_Fim original: 31/12/9999 (sem término informado; não comprova vigência futura).');
    records.push({ kind: 'ncm', code, description: row.Descricao, notes: notes.join('\n') || null, provenance: p });
  }
  if (!records.length) throw new Error('Empty NCM table');
  return records;
}
