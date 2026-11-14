# Fiscal RAG Lab

> Educational, open-source proof of concept: legal-document retrieval, custom vector indexes, deterministic fiscal lookups, an MCP server, and an optional ChatGPT plugin.

**Status:** ingestão de snapshots, lookup CFOP/NCM, fragmentação legal, BM25, índices exato/IVF/HNSW e MCP HTTP com testes. [Demonstração HTTPS na AWS](https://d2kvl1uo6lcsgz.cloudfront.net) com 10.516 NCMs, 619 CFOPs e documentação oficial nacional, paulista e mineira: [cobertura e reprodução](docs/official-ingestion.md). Teste no Work, revisão fiscal humana e treinamento permanecem pendentes. Não é um sistema de cálculo tributário ou emissão de NF-e.

Para entender o funcionamento desde o início, leia [Como funciona o RAG, passo a passo](README-RAG.md): chamada MCP, preparação dos documentos, vetores, cosseno, BM25 e busca híbrida, com exemplos executáveis e distinção entre o endpoint atual e os experimentos do laboratório.

## Goals

- Study how RAG works below the framework layer: ingest, chunk, embed, index, retrieve, rerank, and cite.
- Implement vector-search algorithms manually, starting with exact cosine search, then IVF and HNSW; compare accuracy, latency, memory and build time.
- Add hybrid retrieval with exact CFOP/NCM code lookup and an in-house BM25 implementation.
- Expose read-only operations over MCP without coupling domain code to a specific LLM or provider.
- Test an agent workflow from ChatGPT, then optionally publish a plugin.
- Learn disciplined architecture: C4, ADRs, ports/adapters, automated tests and measured evaluations.

## Execução local

Requirements: Node.js 22+, npm, and TypeScript (installed as a dev dependency).

```sh
npm ci
npm test
```

`npm start -- --demo` inicia um MCP local com dados sintéticos, sem valor fiscal. Endpoint: `http://127.0.0.1:3000/mcp`. Veja [servidor](apps/mcp-server/README.md), [fontes](docs/sources.md), [contratos](docs/mcp-contracts.md) e [benchmark vetorial](docs/benchmarks/README.md). Estado completo em [tasks.md](tasks.md).

## Repository map

- `packages/vector-core/`: cosseno, busca exata, persistência JSON, K-Means esférico, IVF e HNSW próprios.
- `packages/retrieval/`: fragmentação legal, BM25, fusão e filtros de recuperação.
- `packages/fiscal-domain/`: lookup determinístico de códigos e versões.
- `packages/corpus/`: evidências, procedência e relações legais.
- `packages/adapters/`: embeddings locais e controle lexical offline.
- `packages/validation/`: contratos em classes próprias, com Zod encapsulado e integração MCP por adaptador.
- `apps/ingestion-worker/`: snapshots imutáveis e parsers CFOP/NCM.
- `apps/mcp-server/`: adaptador Streamable HTTP MCP e composição do runtime.
- `plugins/fiscal-rag/`: pacote portátil conectado ao endpoint HTTPS, skill, ícones e casos para revisão.
- `docs/c4/workspace.dsl`: C4 model in Structurizr DSL (context, container, component).
- `docs/adr/`: decisões arquiteturais aceitas e limitações de implementação.
- `docs/evaluation.md`: benchmark and accuracy plan.
- `tasks.md`: staged implementation with coherent commits.

## Boundaries and data provenance

- Do not hard-code tax rates as universal facts; state, regime, product classification, date, and transaction context matter.
- Treat CFOP/NCM codes as exact-match identifiers first, not fuzzy concepts.
- Every cited legal excerpt should carry its source URL, publication/version and effective date.
- Do not commit downloaded normative document mirrors or copyrighted manuals until redistribution rights are verified; prefer ingestion scripts and source manifests.
- The prototype provides **research and evidence**, not professional fiscal advice.
- All MCP tools must be read-only at first and validate parameters server-side.

## Plugin e pendências

O pacote aponta para o [MCP implantado](https://d2kvl1uo6lcsgz.cloudfront.net/mcp). Consulte [empacotamento](plugins/fiscal-rag/README.md), [operação AWS](deploy/aws/README.md) e [materiais de revisão](docs/plugin-review.md). Cliente MCP remoto foi testado; a instalação/teste no ChatGPT Work, vídeo e submissão permanecem abertos. LoRA e comparação com modelos ficam em aberto por decisão do usuário; os datasets e manifestos estão preparados.

Bloqueios e melhorias em [TODO.md](TODO.md); tarefas concluídas e seus escopos de commit em [tasks.md](tasks.md). Credenciais CSV e dados pessoais de contato ficam fora do Git. A política publicada recebe o contato somente durante a geração dos artefatos.

Consultas fiscais seguem [modo RAG exclusivo](docs/rag-only.md): evidência apenas das ferramentas fiscais, sem fallback externo e com abstenção quando o corpus é insuficiente. A busca web do Codex está desativada neste projeto; limites do controle por instruções estão documentados.

Guias oficiais: [empacotamento](https://developers.openai.com/plugins/build/plugins) e [submissão](https://developers.openai.com/plugins/deploy/submission).

## License

Code: MIT, see [LICENSE](LICENSE). Third-party normative texts and government documentation retain their applicable terms.
