# Fiscal RAG Lab

> Educational, open-source proof of concept: legal-document retrieval, custom vector indexes, deterministic fiscal lookups, an MCP server, and an optional ChatGPT plugin.

**Status:** ingestão de snapshots, lookup CFOP/NCM, fragmentação legal, BM25, índices exato/IVF/HNSW e MCP HTTP com testes. Corpus oficial revisado, deploy público e experimento de treinamento ainda dependem de preparação externa. Não é um sistema de cálculo tributário ou emissão de NF-e.

## Goals

- Study how RAG works below the framework layer: ingest, chunk, embed, index, retrieve, rerank, and cite.
- Implement vector-search algorithms manually, starting with exact cosine search, then IVF and HNSW; compare accuracy, latency, memory and build time.
- Add hybrid retrieval with exact CFOP/NCM code lookup and an in-house BM25 implementation.
- Expose read-only operations over MCP without coupling domain code to a specific LLM or provider.
- Test an agent workflow from ChatGPT, then optionally publish a plugin.
- Learn disciplined architecture: C4, ADRs, ports/adapters, automated tests and measured evaluations.

## Quick start: first working component

Requirements: Node.js 22+, npm, and TypeScript (installed as a dev dependency).

```sh
npm install
npm test
```

`npm start -- --demo` inicia um MCP local com dados sintéticos, sem valor fiscal. Endpoint: `http://127.0.0.1:3000/mcp`. Veja [servidor](apps/mcp-server/README.md), [fontes](docs/sources.md), [contratos](docs/mcp-contracts.md) e [benchmark vetorial](docs/benchmarks/README.md). Estado completo em [tasks.md](tasks.md).

## Repository map

- `packages/vector-core/`: hand-written vector mathematics and exact-search baseline.
- `packages/retrieval/`: fragmentação legal, BM25, fusão e filtros de recuperação.
- `packages/fiscal-domain/`: lookup determinístico de códigos e versões.
- `packages/corpus/`: evidências, procedência e relações legais.
- `packages/adapters/`: embeddings locais e controle lexical offline.
- `apps/ingestion-worker/`: snapshots imutáveis e parsers CFOP/NCM.
- `apps/mcp-server/`: adaptador Streamable HTTP MCP e composição do runtime.
- `plugins/fiscal-rag/`: portable plugin packaging and draft skill; connection wiring comes after MCP implementation.
- `docs/c4/workspace.dsl`: C4 model in Structurizr DSL (context, container, component).
- `docs/adr/`: proposed architecture decision records.
- `docs/evaluation.md`: benchmark and accuracy plan.
- `tasks.md`: staged implementation with coherent commits.

## Boundaries and data provenance

- Do not hard-code tax rates as universal facts; state, regime, product classification, date, and transaction context matter.
- Treat CFOP/NCM codes as exact-match identifiers first, not fuzzy concepts.
- Every cited legal excerpt should carry its source URL, publication/version and effective date.
- Do not commit downloaded normative document mirrors or copyrighted manuals until redistribution rights are verified; prefer ingestion scripts and source manifests.
- The prototype provides **research and evidence**, not professional fiscal advice.
- All MCP tools must be read-only at first and validate parameters server-side.

## Plugin roadmap

The `plugins/fiscal-rag/plugin.json` and `SKILL.md` are initial portable package skeletons. Once the MCP service is deployed at a stable HTTPS endpoint, register that endpoint using the currently supported ChatGPT Plugins flow, then add the MCP configuration and submit for review if publishing publicly.

Official guides:
- https://developers.openai.com/plugins/quickstart
- https://developers.openai.com/plugins/build/plugins
- https://developers.openai.com/plugins/deploy/submission

## License

Code: MIT, see [LICENSE](LICENSE). Third-party normative texts and government documentation retain their applicable terms.
