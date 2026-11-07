# Official national, São Paulo and Minas Gerais load

Executed on 2026-11-14, in national → São Paulo → Minas Gerais order. The [per-source report](data/official-corpus.json) contains exact URLs, hashes, bytes, observations, counts and exclusions. Downloads and corpus remain in `.data/`, outside Git.

| Content | Count |
|---|---:|
| Downloaded sources | 71 |
| Indexed sources | 66 |
| Complete NCMs | 10,516 |
| CFOPs | 619 |
| National evidence | 13,604 |
| SP evidence | 8,504 |
| MG evidence | 11,388 |
| Total evidence | 33,496 |

Source counts use ingestion IDs: the full SP HTML is downloaded for separate book/annex selections. Thus 71 downloaded entries represent 70 distinct official URLs, not 71 independent publications.

NCM: Receita/Siscomex public Classif JSON consulted on 2026-11-14. Notes retain hierarchy so descriptions such as “Other” keep context. Known start dates and legal acts are preserved; sentinel end 31/12/9999 becomes unknown, with its original value in notes. Current downloads are not a complete history or automatic product classification.

CFOP: official Portal NF-e spreadsheet published on 2026-09-04, IT 2023.002 v2.10, including title, explanatory note and row dates. The consulted edition/table dates do not establish applicability of today's wording to every past period. Code lookup does not determine the correct transaction.

National documents: Receita download/Classif pages; Convênio SINIEF s/n (1970), Ajuste SINIEF 07/05 and Convênio ICMS 142/18. They include CFOP, tax-status, NF-e, ST and CEST documentation. Extracted text is not an independently structured table for every classification.

SP: RICMS/2000 books I–V and annexes I–III, extracted from the official full version. Revoked-text markers `revogado`, `sefazElement-TextoRevogado` and strikethrough are removed. A corrupted source section is excluded without guessing letters/conditions. The former revoked Annex V is outside this selection; CFOP lookup uses the national table. Other annexes and individual state acts lack systematic coverage.

MG: RICMS/2023 general part and annexes I–X, from the official index excluding revoked provisions, including continuation pages. The crawler accepts only recognized files in the same official directory with a page limit. Selectors/encoding are validated; external links are not followed.

Archived but not indexed: NCM/uTrib dated 2026-09-02, IBS/CBS tax classification dated 2026-10-30, MOC 7 overview/Annex I and the MG navigation index. Auxiliary spreadsheets need specific parsers; PDFs need table-preserving extraction and review against later technical notes. Until indexed, these files do not support RAG answers. Full NESH and all consultation rulings are not included.

Consolidation validity remains unknown. There are no automatic updates, comprehensive legal coverage, human tax validation or learned semantic embeddings. São Paulo and Minas Gerais are the only included states, as selected by the user.

## Reproduce and update

```sh
npm ci
npm run ingest:official
# Reprocess local snapshots without claiming a new source consultation:
npm run ingest:official -- --reuse
# Rebuild while verifying local-byte hashes:
npm run corpus:build -- .data/official/manifest.json .data/rebuilt-corpus.json
npm start
```

Catalog: `config/official-sources.json`. Each source produces an immutable snapshot and metadata observation. Failures are recorded; missing NCM, CFOP or a requested state prevents replacement of the active corpus. `.data/corpus.json` feeds the local runtime; `.data/official/corpus.json` feeds AWS packaging. Code-evidence IDs remain stable by source, hash, code and period, regardless of assembly order.

Publish with `npm run build:lambda`, `npm run public:prepare -- .data/aws/contact.json .data/aws/public`, then `scripts/aws-deploy.ps1 -Action Update`, monitor `Status` and complete `Finish`. Updates preserve the previous artifact and secret parameters. `/health` exposes counts and SHA-256 of the loaded corpus. `npm run smoke:remote -- https://d2kvl1uo6lcsgz.cloudfront.net/mcp` compares that hash against the local package and checks present/missing codes, citations, SP/MG searches and earlier/modern protocols. This does not prove LLM behavior in Work.

Observed local conditions before final ID organization: Windows, Node 22.17.0, 128-dimensional lexical hashing, exact index + BM25, 32,243 evidence items; startup 2.41 seconds, final RSS about 521 MiB, one measurement without isolated process/forced GC. This is neither a fiscal benchmark nor evaluated retrieval quality. The final edition has 33,496 evidence items; Lambda memory increased from 256 to 1,024 MiB without provisioned concurrency. Fixed algorithm benchmarks remain separate from this operational load.
