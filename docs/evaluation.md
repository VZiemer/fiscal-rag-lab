# Evaluation plan

Implemented: [fixed 40-case dataset](../eval/README.md), [retrieval comparison](benchmarks/retrieval.md) and [vector benchmark](benchmarks/README.md). These evaluate retrieval and contracts with published limitations; baseline/RAG/RAG+LoRA answer comparison still requires an actual model and training environment.

## Dataset

Build a curated, version-tagged set of queries (start with 30–50), with human-reviewed source references. Include exact CFOP/NCM queries, ambiguous state/regime questions, outdated norms, confusing abbreviations, and questions where the correct response is 'insufficient evidence'. No real private invoice data.

## Retrieval metrics

- `Recall@5`, `Recall@10`: fraction of ground-truth relevant chunks found in top K.
- `MRR@10`: inverse rank of the first relevant passage.
- Mean/p50/p95 latency by query class.
- Index build time, on-disk bytes and resident memory.
- Source version / date-filter correctness, reported separately.

## Agent metrics

- Tool-selection accuracy and unnecessary tool calls.
- Citation-grounding percentage and unsupported-claim count.
- Missing-field elicitation and correct abstention rates.

## Comparisons

1. Exact brute-force vs. IVF vs. HNSW on the **same** vectors and fixed hardware.
2. BM25 vs. vector retrieval vs. hybrid/RRF.
3. LLM alone vs. RAG-backed LLM vs. RAG+fine-tuned LLM (later).

## Rules

Keep evaluation questions separate from fine-tuning data. Record random seeds, embeddings model/version, hardware, corpus size and date, index parameters and test run code revision.
