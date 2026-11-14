# ADR-0002: Implement vector-search algorithms in-house

- Status: **Proposed**
- Date: 2026-11-14

## Context

The primary educational goal is to understand indexing mathematics, data structures and retrieval trade-offs rather than outsourcing search to an off-the-shelf vector database.

## Decision

Implement exact brute-force cosine search first, then IVF with in-house K-Means, then HNSW. Define a common `VectorIndex` port, deterministic fixtures and reproducible benchmarks; benchmark each approximate index against exact top-k ground truth. Generate embeddings through an independent port rather than train an embedding model initially.

## Consequences

+ Algorithmic control and transparency; credible measurable portfolio work.
- More code and possible numerical/performance bugs.
- Custom indexes are educational, not production replacements until rigorously validated.

## Alternatives

FAISS, pgvector, Chroma or Pinecone as the indexing engine (defer until comparison phase).
