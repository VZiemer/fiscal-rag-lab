# MCP server

`npm start -- --demo` starts at `127.0.0.1:3000` with a **synthetic corpus with no fiscal value**. For reviewed data, set `MCP_CORPUS=.data/corpus.json` with `{version:1,evidence:[...],codes:[...]}`. No official corpus is embedded. Format example: `test/fixtures/demo-corpus.json`; replace its synthetic provenance as well. Never use fabricated URLs or hashes in official data.

Tools: `search_regulations`, `get_cfop`, `get_ncm` and `explain_rule`. Contracts are in `docs/mcp-contracts.md`. The official SDK supports 2026-07-28 negotiation and earlier stateless compatibility; integration is tested with an independent official client over an HTTP socket. Each request creates its own MCP instance. Search uses the exact index by default; approximate indexes are compared separately.

Embeddings: `EMBEDDING_PROVIDER=hash` uses an offline lexical control. For learned semantics, configure `ollama`, a pinned `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS` and `OLLAMA_URL`; the embedding runtime must be available. Do not mix models in an evaluation. The corpus is indexed at startup; queries never write to it.

`/health` reports readiness after corpus loading and indexing. The server enforces a 64 KiB body limit, HTTP timeout, Host/Origin validation and sanitized errors. `MCP_ALLOWED_HOSTS` takes comma-separated hostnames; `MCP_ALLOWED_ORIGINS` takes exact origins. Do not automatically trust `X-Forwarded-*`. TLS and operational limits are handled by deployment. Domain and retrieval code do not import the SDK.
