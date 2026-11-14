import { test } from 'node:test';
import assert from 'node:assert/strict';
import iconv from 'iconv-lite';
import { officialSession } from '../dist/apps/ingestion-worker/src/official-fetch.js';
import { decodeOfficialHtml, inspectOfficialHtml } from '../dist/apps/ingestion-worker/src/official-html.js';
import { parseCfopRows, parseNcmJson } from '../dist/apps/ingestion-worker/src/fiscal-parsers.js';

const p = { sourceId: 'synthetic', sourceUrl: 'https://www.gov.br/test', authority: 'SYNTHETIC TEST', jurisdiction: 'BR',
  edition: 'test', publishedAt: null, validFrom: null, validTo: null, fetchedAt: '2026-11-14T12:00:00Z', checksum: 'a'.repeat(64) };
test('official session handles cookie redirects and rejects origin changes and loops', async () => {
  let calls = 0;
  const session = officialSession(async (url, init) => {
    assert.equal(init.redirect, 'manual');
    if (calls++ === 0) return new Response('', { status: 302, headers: { location: '/test?cookie=1', 'set-cookie': 'session=synthetic; Path=/; HttpOnly' } });
    assert.equal(new Headers(init.headers).get('cookie'), 'session=synthetic');
    return new Response('official test');
  });
  assert.equal(await (await session('https://www.gov.br/test')).text(), 'official test');
  await assert.rejects(officialSession(async () => new Response('', { status: 302, headers: { location: 'https://other.gov.br/path' } }))('https://www.gov.br/test'), /Cross-origin/);
  await assert.rejects(officialSession(async () => new Response('', { status: 302, headers: { location: '/loop' } }))('https://www.gov.br/test'), /limit/);
});
test('HTML keeps article exceptions, decodes MG punctuation and excludes revoked/corrupt sections', () => {
  const mg = '<div id="conteudo"><div class="WordSection1"><p>(175) Art. 2º – Regra sintética de operação.</p><p>Salvo exceção sintética.</p></div></div>';
  const decoded = decodeOfficialHtml(iconv.encode(mg, 'windows-1252'), 'text/html;charset=ISO-8859-1');
  const result = inspectOfficialHtml(decoded, 'mg', 'mg-test', p);
  assert.ok(result.evidence[0].text.includes('– Regra'));
  assert.equal(result.evidence[0].article, '2º');
  assert.ok(result.evidence[0].relatedIds.length);
  const sp = '<div id="test_ControlWrapper_RichHtmlField"><p>Artigo 1 - Regra atual sintética.</p><p class="revogado">Texto antigo.</p><p class="sefazElement-TextoRevogado">Mais texto antigo.</p><p>Artigo 2 - Texto \u0081 corrompido.</p><p>Condição que pertence ao artigo corrompido.</p><p>Artigo 3 - Regra íntegra.</p></div>';
  const parsed = inspectOfficialHtml(sp, 'sp', 'sp-test', p);
  assert.equal(parsed.omittedSections, 1);
  assert.ok(parsed.evidence.every(e => !/antigo|corrompido|Condição/.test(e.text)));
  assert.equal(parsed.evidence.length, 2);
  assert.throws(() => inspectOfficialHtml('<html>Error</html>', 'mg', 'test', p), /selector/);
});
test('real-schema CFOP aliases and NCM hierarchy retain context without claiming future validity', () => {
  const cfop = parseCfopRows([['CFOP','Início de vigência','Fim de vigência','Título do CFOP','Descrição (nota explicativa)'],[5102,'01/01/2020',null,'Título sintético','Nota sintética']], p);
  assert.equal(cfop[0].notes, 'Nota sintética');
  const ncm = parseNcmJson(JSON.stringify({ Nomenclaturas: [
    {Codigo:'12',Descricao:'Capítulo sintético'}, {Codigo:'12.34',Descricao:'Posição sintética'},
    {Codigo:'1234.5',Descricao:'Subposição sintética'}, {Codigo:'1234.56',Descricao:'Divisão sintética'},
    {Codigo:'1234.56.7',Descricao:'Item sintético'},
    {Codigo:'1234.56.78',Descricao:'Outros sintéticos',Data_Inicio:'01/01/2020',Data_Fim:'31/12/9999'},
    {Codigo:'99',Descricao:'Outro capítulo'}, {Codigo:'9999.99.99',Descricao:'Outra folha'}
  ] }), p);
  assert.equal(ncm.length, 2);
  assert.equal(ncm[0].provenance.validTo, null);
  assert.match(ncm[0].notes, /1234567: Item sintético/);
  assert.match(ncm[0].notes, /31\/12\/9999/);
  assert.doesNotMatch(ncm[1].notes, /Capítulo sintético/);
  assert.throws(() => parseNcmJson(JSON.stringify({Nomenclaturas:[{Codigo:'1234.X',Descricao:'invalid'}]}), p));
});
