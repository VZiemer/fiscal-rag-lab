# Task plan (suggested commit scopes)

## Milestone 0 — Architecture and baseline
- [x] Establish public-ready repository scaffold, C4 model, proposed ADRs and contributor rules. (`docs: initialize architecture and governance`)
- [x] Implement brute-force cosine vector index with automated tests. (`feat(vector): add exact-search reference implementation`)
- [x] Review and accept/revise ADR-0001 to ADR-0005. (`docs(adr): accept initial decisions`)
- [x] Enforce dependency boundaries, reproducible installs and runtime audit in CI. (`ci: verify architecture and runtime`)

## Milestone 1 — Authoritative data ingestion
- [x] Inventory official NF-e/CFOP/NCM sources and redistribution constraints. (`docs(sources): catalog official sources`)
- [x] Build source download + checksum + metadata persistence. (`feat(ingest): add source snapshots`)
- [x] Parse structured CFOP source and implement strict code lookup. (`feat(fiscal): implement CFOP lookup`)
- [x] Add legal-aware text chunking with article/exception relationships. (`feat(ingest): add legal chunker`)
- [x] Add embedding-provider port and one implementation. (`feat(embedding): add provider adapter`)
- [x] Connect verified snapshots, parsers and chunking to a runtime-loadable corpus CLI. (`feat(ingest): assemble verified corpus`)

## Milestone 2 — Hand-built retrieval
- [x] Add exact vector index snapshot serialization. (`feat(vector): persist index`)
- [x] Implement BM25 lexical inverted index. (`feat(retrieval): add BM25`)
- [x] Implement K-Means and IVF. (`feat(vector): add IVF`)
- [x] Implement HNSW and benchmark. (`feat(vector): add HNSW`)
- [x] Implement exact/lexical/vector query routing + RRF. (`feat(retrieval): add hybrid search`)

## Milestone 3 — MCP and public demo
- [x] Define structured read-only MCP tool contracts. (`docs(mcp): specify tool contracts`)
- [x] Implement Streamable HTTP MCP adapter and integration tests. (`feat(mcp): add retrieval tools`)
- [x] Prepare deployment package, rate limits, privacy and sanitized request logs locally. (`ops: prepare MCP demo deployment`)
- [x] Deploy HTTPS demo endpoint with rate limits, request logs and privacy policy. (`ops: deploy MCP demo`)
- [x] Prepare portable plugin MCP configuration and public-package generator locally. (`feat(plugin): prepare MCP package`)
- [x] Wire the deployed HTTPS backend and prepare listing assets/review cases. (`feat(plugin): wire public MCP endpoint`)
- [ ] Add MCP dependency to plugin package and test in ChatGPT Work. (`feat(plugin): connect MCP backend`)
- [x] Prepare review materials and record an executable local MCP transcript. (`docs(plugin): prepare review materials`)
- [ ] Record demo and submit plugin for review when ready. (`docs(plugin): prepare public submission`)

## Milestone 4 — Research and fine-tuning
- [x] Prepare a held-out citation/source-evidence dataset. (`test(evals): add fiscal benchmark`)
- [x] Compare retrieval variants and publish reproducible results. (`perf: compare search algorithms`)
- [x] Prepare isolated behavior datasets, conversational export and LoRA experiment manifest. (`experiment(ft): prepare behavior adapter`)
- [ ] Create behavior-supervision dataset and LoRA experiment. (`experiment(ft): train behavior adapter`)
- [ ] Compare baseline, RAG and RAG+fine-tuning. (`docs(evals): publish model comparison`)
