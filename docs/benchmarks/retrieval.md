# Retrieval comparison v1

Reproduce with `npm ci` and `npm run eval:retrieval -- .data/retrieval-results.json`. Full results in `retrieval-results.json` include **every query**, returned sources, metrics, category timings, parameters, base revision and dataset/code hashes. Seeds and conditions are fixed; all variants use the same 40 cases.

| Variant | Recall@5 | Recall@10 | MRR@10 | Route/context/abstention/validity criteria |
|---|---:|---:|---:|---:|
| BM25 | 1.000 | 1.000 | 1.000 | 10/10 |
| Exact vector | 1.000 | 1.000 | 0.922 | 10/10 |
| Hybrid RRF | 1.000 | 1.000 | 0.969 | 10/10 |
| IVF vector | 1.000 | 1.000 | 0.932 | 10/10 |
| HNSW vector | 1.000 | 1.000 | 0.922 | 10/10 |

Recall/MRR use 32 cases with relevant evidence. The other eight are not counted as retrieval successes without a reference. Ten cases have additional criteria, including two temporal cases. The corpus contains only ten editorial paraphrases of two Receita Federal pages and lexically close questions. There is no human tax validation or answer-generation evaluation.

The provider is `lexical-fnv1a-v1`, 128 dimensions, **without learned embeddings**. BM25 had the best MRR; RRF did not outperform it. This does not establish regulatory interpretation performance. A future semantic evaluation should use a pinned Ollama model/digest, without silently changing the provider behind published results.

One pass over 40 queries, with one warmup per variant. Mean/p50/p95 by class are in JSON; samples of two/four queries are statistically insufficient. Construction includes embeddings even for lexical mode because shared composition initializes both indexes. Sequential post-GC heap/RSS deltas may be negative and do not measure isolated sizes. Results were not selected from a best run.

The retriever requests candidates before legal filtering; HNSW expands `ef` to corpus size. Approximation/cost effects are better measured by the [independent vector benchmark](README.md). IVF remains limited to probed lists. This tiny corpus is not evidence of ANN scalability.
