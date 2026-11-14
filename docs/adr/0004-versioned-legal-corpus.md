# ADR-0004: Treat legal texts as versioned, attributable evidence

- Status: **Proposed**
- Date: 2026-11-14

## Context

Tax rules depend on jurisdiction, date, status of publication, specific operation context and superseding documents. Semantic similarity alone cannot establish fiscal correctness.

## Decision

Store source URL, authority, retrieved-at date, document edition, legal hierarchy, effective period and SHA-256 checksum. Preserve section/article structure and relationships between exceptions and the rule. Use deterministic CFOP/NCM lookup for exact identifiers; use RAG to retrieve explanatory context. Mark missing dates and missing context explicitly. Do not redistribute complete downloaded documents without validating source-specific licenses.

## Consequences

+ Reproducible research with verifiable citations and temporal answers.
- Ingestion and validity logic require more modeling and editorial oversight.

## Alternatives

Plain PDF chunks and unversioned embeddings (simpler but insufficient for reliable fiscal research).
