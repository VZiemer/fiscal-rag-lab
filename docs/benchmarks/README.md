# Vector benchmark

Reproduce with `npm ci` and `npm run benchmark:vectors -- .data/vector-benchmark.json` (Node 22, repository root). The versioned JSON records seed, CPU, memory, parameters, code hash and every variant. Uniform synthetic data: 1,000 vectors, 32 dimensions, 100 independent queries, k=10, five warmups and three repetitions. Exact search is the reference. This is not a fiscal or semantic-embedding benchmark.

| Variant | Recall@10 | Mean ms | p95 ms | Build ms |
|---|---:|---:|---:|---:|
| Exact | 1.000 | 0.243 | 0.326 | 1.980 |
| IVF, 16 lists / 4 probes | 0.604 | 0.084 | 0.122 | 60.706 |
| HNSW, M=12 / ef=64 | 0.998 | 0.516 | 0.631 | 754.577 |

At this scale, HNSW was slower than exact search. Sorted queues and graph traversal cost exceeded comparison savings; this should guide optimization rather than be omitted. IVF was faster with substantial recall loss. Do not generalize to large corpora.

Memory is a heap/RSS delta in one process after GC; JIT, allocator and previous structures interfere. JSON size is diagnostic (only the exact format is restorable); IVF serialized size is not measured. These values are not isolated resident sizes. Variation across repeats and process isolation remain future improvements, not completed measurements.
