# Contributor / coding-agent instructions

- Make one coherent commit per completed task in `tasks.md`; do not mix unrelated refactors into feature commits.
- Use TypeScript for application code; explain algorithmic trade-offs in English comments, and user-facing docs in Portuguese when appropriate.
- Follow ports and adapters. MCP must be an adapter; retrieval and fiscal logic must not import ChatGPT-specific packages.
- Implement vector indexing, similarity, BM25, IVF and HNSW without delegating those algorithms to turnkey vector-search libraries.
- Third-party libraries are allowed for networking, parsing, schema validation and embeddings, with an ADR if they affect architecture.
- Write unit tests for all numerical algorithms and integration tests for MCP tool contracts.
- Use fixed evaluation datasets and publish benchmark conditions, not only selected best-case results.
- Keep documents, historical validity, official source URLs and update timestamps in retrieved evidence.
- Never put secrets, personal data, API tokens or unverified document mirrors in git.
- Do not claim tax correctness without qualification; require user context and a valid source for an assertion.

## Fiscal research: RAG-only evidence

- For fiscal questions, retrieve evidence exclusively through `search_regulations`, `get_cfop`, `get_ncm` and `explain_rule` from this project's RAG. Do not use web search, browsers, external connectors, shell HTTP requests or opening a source URL as a fallback for fiscal facts.
- Do not supplement missing evidence with remembered legislation, code descriptions, classifications, rates or dates from model training. Rephrase only supported evidence, preserving citations, edition, validity and exceptions.
- If fiscal tools are unavailable, report that the RAG could not be consulted. If results are absent or insufficient, state "Evidência insuficiente no RAG" and identify missing context. Never treat a missing corpus entry as legal nonexistence.
- Official URLs in returned evidence are attribution, not permission to fetch additional content during the answer. Source ingestion and maintenance are separate, explicitly requested workflows.
