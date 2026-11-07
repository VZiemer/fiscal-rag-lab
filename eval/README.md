# Fixed evaluation dataset v1

`heldout.json`: 40 queries held apart from training — 30 retrieval, 4 exact lookups without loaded records, 2 insufficient-context, 2 abstention and 2 unknown-validity cases. Ten evidence items are **editorial paraphrases**, not transcribed rules. Provenance points to two official Receita pages captured on 2026-11-14; checksums identify original HTML stored locally in `.data/sources/`, without Git mirrors.

The corpus covers Classif/NCM-download capabilities/limitations, not CFOP recommendations, product classification or tax calculations. Exact-code queries test absence without claiming legal existence/nonexistence. Jurisdictions, known-validity editions, exceptions and synthetic codes are exercised in integration tests outside this corpus.

Sources: [Receita download](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/download-ncm-nomenclatura-comum-do-mercosul) and [Classif](https://www.gov.br/receitafederal/pt-br/assuntos/aduana-e-comercio-exterior/classificacao-fiscal-de-mercadorias/classif). Publication/validity were not inferred from page labels. Both intervals are unknown and tests require that status.

An agent reviewed labels editorially; human tax review remains pending. Questions are lexically close to paraphrases and the corpus is small. High recall does not establish real-legislation capability. Never tune using the best held-out results; create/freeze a development set before a future evaluation.

Metrics in `packages/evaluation/`: Recall@5/10 and MRR@10 exclude no-reference cases (`null`), which have separate route/context/abstention criteria. Publish per-query results with averages. LLM-answer grounding/evaluation is another stage, not implied by retrieval metrics.

Portuguese queries/evidence remain unchanged as fixed, language-specific evaluation inputs. Translating them would define a new dataset and invalidate comparisons with published hashes/results.
