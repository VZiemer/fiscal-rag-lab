# First acceptance case: hardware resale from SP to MG

Question/context: `eval/scenarios/initial-hardware-sale.json`. These are user-reported facts without company identifiers or document numbers. The statement that the company has no tax substitution (ST) was not treated as legal verification that the whole transaction is outside ST.

The user explicitly authorized the project MCP client to call the four RAG tools. No external consultation, new source download or remembered tax descriptions supported the answer. Full queries live in `.data/initial-scenario-results-*.json`; Git retains references/hashes without mirroring documents.

Documentary result: **candidate CFOP 6.102, conditional on the transaction actually being outside ST and matching the reported resale characteristics**. The `get_cfop` record describes goods acquired/received from third parties without industrial processing by the establishment. Record 6.108 addresses non-taxpayers; this scenario reports a taxpayer buying for own use. Source: `nfe-cfop-20260904`, IT 2023.002 v2.10, published 2026-09-04, [NF-e spreadsheet](https://www.nfe.fazenda.gov.br/portal/exibirArquivo.aspx?conteudo=74KmX8poGpM=). Complete records/qualifications were returned by the RAG.

NCM 8302.10.00 was found in Classif with a hinge description and base-metal hardware hierarchy. This does not certify classification of the actual product. Search also returned item 76.0, CEST 10.076.00, NCM 8302.10.00 in the MG table: evidence `mg-anexovii2023_4:section:2:unit:41:part:1`, [MG Annex VII](https://www.fazenda.mg.gov.br/empresas/legislacao_tributaria/ricms_2023_seco/anexovii2023_4.html). Its presence requires applicability review; alone it proves neither ST liability nor its absence.

Every query returned unknown validity for 2026-11-14. The result is conditional, without human tax approval or definitive invoice instructions. Do not infer CSOSN, rates, DIFAL or ST exemption from this test.

`npm run eval:initial` checks code presence, relevant descriptions/notes, provenance, a pinned CFOP-table hash, unknown validity, retrieval of the ST warning and opening by ID through the remote MCP client. Execution report: `docs/data/initial-scenario-contract.json`. It validates contracts/retrieval, not LLM reasoning or final tax correctness. This is a development/acceptance case separate from `heldout`.

Observed gaps: generic resale queries ranked returns/transfers above the candidate; the interstate group's explicit definition was not recovered. Historical CONFAZ text dates have not become provision-level intervals. These gaps are in `TODO.md`; the scenario is not complete approved tax guidance.
