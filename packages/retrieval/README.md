# Document retrieval

Implemented: legal text chunking with relationships, a custom BM25 inverted index, an embedding port, complete-identifier routing and RRF fusion. Exact, IVF/K-Means and HNSW indexes live in `packages/vector-core`. None delegates search to a turnkey vector library.

`HybridRetriever.create` receives the corpus, code repository, embedding provider and vector index through ports. Outputs distinguish the route and include ranking scores, provenance, validity and legal relationships. Temporal filtering excludes incompatible intervals and retains unknown boundaries as unknown. Search obtains candidates before filtering; partitioning for larger corpora remains in the TODO list.

The offline embedding control is lexical, without learned semantics. The [benchmarks](../../docs/benchmarks/retrieval.md) publish data, conditions and failures; recall does not measure tax correctness. Exception links are text heuristics, not automatic legal interpretation.
