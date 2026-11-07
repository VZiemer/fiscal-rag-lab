# Official source catalog

Reviewed on 2026-11-14. Actual downloads/indexing and coverage limits are in the [official load guide](official-ingestion.md) and [per-source report](data/official-corpus.json). This catalog also preserves initial research entry points. Publication, validity and hashes are recorded per snapshot, never inferred from this review date.

| Source | Authority / scope | Format / updates | Use and redistribution |
|---|---|---|---|
| [SINIEF agreement s/n (1970), Annex II](https://www.confaz.fazenda.gov.br/legislacao/ajustes/sinief/cvsn_70) | CONFAZ / national CFOP | Consolidated HTML, subject to amendments | Downloaded/indexed in this load; preserve amendments and dates. |
| [NF-e miscellaneous documents](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=%2FNJarYc9nus%3D) | National NF-e Portal / CFOP and NCM-uTrib tables | Versioned spreadsheets; consulted index lists CFOP dated 2026-09-04 | Resolve portal file links and pin checksums; not a complete historical source. Automated access may redirect. |
| [NF-e technical reports](https://www.nfe.fazenda.gov.br/portal/listaConteudo.aspx?tipoConteudo=B%2F6oigHgyAw%3D) | National NF-e Portal / technical changes | PDF; IT 2023.002 v2.10 in the consulted index | Manual/editorial presentation redistribution permission is not established. Local storage only. |
| [NCM download](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul) | Receita Federal / goods classification | [Public Classif JSON](https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json), XLSX | Receita describes the download as the current table, excluding past/future codes. History requires a specific lookup. |
| [Classif](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/classif) | Receita Federal / NCM history | Lookup, legal/explanatory notes | NESH and compilations have separate terms; public access does not imply permission for full mirroring. |
| [NF-e Portal](https://www.nfe.fazenda.gov.br/portal/principal.aspx) | ENCAT / RFB / tax authorities | MOC, technical notes, XML schemas | Technical schemas alone do not establish tax treatment; check version, environment and schedule. |
| [Full SP RICMS](https://legislacao.fazenda.sp.gov.br/Paginas/textoricms.aspx) | SEFAZ-SP | HTML, books I–V and selected annexes I–III | Revoked text removed; corrupted section omitted. |
| [MG RICMS 2023 excluding revoked provisions](https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/ricms_2023_seco/sumario2023_1.html) | SEF-MG | Paginated HTML, general part and annexes I–X | Index/continuation pages downloaded with URL/hash per page. |

[Articles 7 and 8 of Law 9.610/1998](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) distinguish official acts from compilations/other materials. This project's conservative policy versions manifests, scripts and synthetic fixtures only. The catalog is not a legal opinion on licenses. Downloads stay in ignored `.data/`. Do not substitute third-party mirrors when official sources fail.

Procedure: locate official edition → record exact URL/authority → download with size/timeout limits → inspect type/content → SHA-256 → record known dates and `null` unknowns → review before exposing as evidence. Changed bytes create a new edition rather than overwrite history.
