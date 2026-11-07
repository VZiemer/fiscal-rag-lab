# Task plan (suggested commit scopes)

## Milestone 0 — Architecture and baseline
- [x] Establish public-ready repository scaffold, C4 model, proposed ADRs and contributor rules. (`docs: initialize architecture and governance`)
- [x] Implement brute-force cosine vector index with automated tests. (`feat(vector): add exact-search reference implementation`)
- [x] Review and accept/revise ADR-0001 to ADR-0005. (`docs(adr): accept initial decisions`)
- [x] Enforce dependency boundaries, reproducible installs and runtime audit in CI. (`ci: verify architecture and runtime`)
- [x] Run the full CI on every push and pull request, with manual dispatch, pinned Actions, read-only permissions and bounded execution. (`ci: run checks on pushes and pull requests`)
- [x] Audit the publication history for secrets and personal data, replace corporate author emails with GitHub noreply, and document the clean public history. (`docs: record public repository privacy review`)
- [x] Document the implemented runtime, published demo and explicit remaining dependencies. (`docs: document implemented lab`)
- [x] Explain the complete MCP/RAG call flow, current hash vectors, cosine/BM25/RRF search and experimental indexes in a reproducible beginner guide. (`docs: explain MCP and RAG step by step`)
- [x] Expand the main README with technologies and ADR links, and publish reproducible C4 PNG views aligned with the implementation. (`docs: expand project overview and C4 diagrams`)
- [x] Translate documentation, comments, runtime messages, plugin prompts and C4 views into English while preserving original fiscal evidence and language-specific evaluation data. (`docs: translate repository text into English`)

## Milestone 1 — Authoritative data ingestion
- [x] Inventory official NF-e/CFOP/NCM sources and redistribution constraints. (`docs(sources): catalog official sources`)
- [x] Build source download + checksum + metadata persistence. (`feat(ingest): add source snapshots`)
- [x] Parse structured CFOP source and implement strict code lookup. (`feat(fiscal): implement CFOP lookup`)
- [x] Add legal-aware text chunking with article/exception relationships. (`feat(ingest): add legal chunker`)
- [x] Add embedding-provider port and one implementation. (`feat(embedding): add provider adapter`)
- [x] Connect verified snapshots, parsers and chunking to a runtime-loadable corpus CLI. (`feat(ingest): assemble verified corpus`)
- [x] Download official federal/state fiscal sources, validate and index NCM/CFOP and supporting documentation, and publish the populated corpus with an explicit coverage report. (`feat(ingest): populate official fiscal corpus`)

## Milestone 2 — Hand-built retrieval
- [x] Add exact vector index snapshot serialization. (`feat(vector): persist index`)
- [x] Implement BM25 lexical inverted index. (`feat(retrieval): add BM25`)
- [x] Implement K-Means and IVF. (`feat(vector): add IVF`)
- [x] Implement HNSW and benchmark. (`feat(vector): add HNSW`)
- [x] Implement exact/lexical/vector query routing + RRF. (`feat(retrieval): add hybrid search`)

## Milestone 3 — MCP and public demo
- [x] Encapsulate validation in project-owned schema classes, isolate Zod and preserve MCP/CLI/evaluation contracts. (`refactor(validation): encapsulate schema contracts`)
- [x] Define structured read-only MCP tool contracts. (`docs(mcp): specify tool contracts`)
- [x] Implement Streamable HTTP MCP adapter and integration tests. (`feat(mcp): add retrieval tools`)
- [x] Prepare deployment package, rate limits, privacy and sanitized request logs locally. (`ops: prepare MCP demo deployment`)
- [x] Deploy HTTPS demo endpoint with rate limits, request logs and privacy policy. (`ops: deploy MCP demo`)
- [x] Prepare portable plugin MCP configuration and public-package generator locally. (`feat(plugin): prepare MCP package`)
- [x] Wire the deployed HTTPS backend and prepare listing assets/review cases. (`feat(plugin): wire public MCP endpoint`)
- [x] Save the private account plugin and verify its stored skill/MCP components. (`feat(plugin): save private account plugin`)
- [x] Render submission PNGs, validate the final archive and rehearse positive tool contracts. (`build(plugin): validate submission package`)
- [x] Record confirmed free/no-commerce behavior while preserving private account visibility. (`docs(plugin): record free usage declaration`)
- [x] Register the deployed MCP endpoint in the Codex host and verify native configuration. (`ops(mcp): register Codex host connection`)
- [x] Require RAG-only fiscal evidence in the project/private plugin and disable project web search. (`feat(plugin): require RAG-only fiscal evidence`)
- [ ] Add MCP dependency to plugin package and test in ChatGPT Work. (`feat(plugin): connect MCP backend`)
- [x] Prepare review materials and record an executable local MCP transcript. (`docs(plugin): prepare review materials`)
- [ ] Record demo and submit plugin for review when ready. (`docs(plugin): prepare public submission`)

## Milestone 4 — Research and fine-tuning
- [x] Record and validate the initial SP→MG hardware-resale scenario through MCP contracts, with a conditional CFOP expectation and explicit ST/validity limits; keep fiscal approval separate. (`test(evals): add initial hardware-sale scenario`)
- [x] Prepare a held-out citation/source-evidence dataset. (`test(evals): add fiscal benchmark`)
- [x] Compare retrieval variants and publish reproducible results. (`perf: compare search algorithms`)
- [x] Prepare isolated behavior datasets, conversational export and LoRA experiment manifest. (`experiment(ft): prepare behavior adapter`)
- [ ] Create behavior-supervision dataset and LoRA experiment. (`experiment(ft): train behavior adapter`)
- [ ] Compare baseline, RAG and RAG+fine-tuning. (`docs(evals): publish model comparison`)
