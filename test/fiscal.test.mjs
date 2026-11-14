import { test } from 'node:test';
import assert from 'node:assert/strict';
import ExcelJS from 'exceljs';
import { InMemoryFiscalRepository, normalizeCode } from '../dist/packages/fiscal-domain/src/code-repository.js';
import { parseCfopRows, parseCfopXlsx, parseNcmJson } from '../dist/apps/ingestion-worker/src/fiscal-parsers.js';

const provenance = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'TEST ONLY', jurisdiction: 'BR', edition: 'synthetic-v1', publishedAt: null, validFrom: '2020-01-01', validTo: '2026-12-31', fetchedAt: '2026-11-14T12:00:00Z', checksum: 'a'.repeat(64) };
const rows = [['CFOP', 'Título', 'Descrição', 'Início de vigência', 'Fim de vigência'], [5102, 'Título sintético A', 'Nota sintética', '01/01/2020', '31/12/2026']];
test('CFOP XLSX parses structured fields, dates and provenance', async () => {
  const book = new ExcelJS.Workbook();
  book.addWorksheet('CFOP').addRows(rows);
  const records = await parseCfopXlsx(await book.xlsx.writeBuffer(), provenance);
  assert.equal(records[0].code, '5102');
  assert.equal(records[0].provenance.validFrom, '2020-01-01');
  assert.equal(records[0].notes, 'Nota sintética');
  const repo = new InMemoryFiscalRepository(records);
  assert.equal(repo.lookup('cfop', '5.102', '2026-11-14').records[0].temporalStatus, 'valid');
  assert.equal(repo.lookup('cfop', '5102', '2010-01-01').status, 'insufficient-evidence');
  assert.equal(repo.lookup('cfop', '6102').status, 'not-found');
  assert.ok(repo.lookup('cfop', '5102').missingContext.includes('date'));
  records[0].description = 'mutated';
  assert.equal(repo.lookup('cfop', '5102').records[0].description, 'Título sintético A');
});
test('strict lookup rejects approximate codes, duplicates and malformed source schemas', () => {
  for (const code of ['510', '51020', ' 5102', '4.102', 'CFOP5102', '5x102']) assert.throws(() => normalizeCode('cfop', code));
  assert.throws(() => parseCfopRows([['CFOP', 'Descrição'], [5102, 'x']], provenance), /header/);
  assert.throws(() => parseCfopRows([...rows, rows[1]], provenance), /Duplicate/);
  assert.throws(() => parseCfopRows([rows[0], [5102, 'x', '', '30/02/2026', null]], provenance));
  const records = parseCfopRows(rows, provenance);
  assert.throws(() => new InMemoryFiscalRepository([...records, ...records]), /Duplicate/);
  const later = structuredClone(records[0]); later.provenance.edition = 'v2';
  assert.equal(new InMemoryFiscalRepository([...records, later]).lookup('cfop', '5102', '2026-01-01').status, 'ambiguous');
});
test('NCM JSON preserves only complete leaf identifiers and known validity', () => {
  const data = { Nomenclaturas: [{ Codigo: '01', Descricao: 'Synthetic heading' }, { Codigo: '1234.56.78', Descricao: 'Synthetic leaf', Data_Inicio: '01/01/2020', Data_Fim: '31/12/2026' }] };
  const records = parseNcmJson(JSON.stringify(data), provenance);
  assert.equal(records.length, 1);
  assert.equal(new InMemoryFiscalRepository(records).lookup('ncm', '12345678', '2026-01-01').status, 'found');
  assert.throws(() => parseNcmJson('{}', provenance));
});
