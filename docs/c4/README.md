# C4 diagrams

These views document the repository implementation: MCP and retrieval run in one process; ingestion is a separate CLI; vectors and BM25 are built at server startup. They do not represent a new AWS deployment.

| Level | View | File |
|---|---|---|
| 1 — Context | User, MCP client, lab and external integrations. | [PNG](images/01-context.png) · [SVG](images/01-context.svg) |
| 2 — Containers | Server, worker, file corpus and static page. | [PNG](images/02-containers.png) · [SVG](images/02-containers.svg) |
| 3 — Components | Adapter, contracts, retriever, repositories and indexes in the server process. | [PNG](images/03-components.png) · [SVG](images/03-components.svg) |
| 4 — Code | Selected `VectorIndex<T>` port, implementations and cosine function. | [PNG](images/04-code.png) · [SVG](images/04-code.svg) |

## Source and generation

[model.json](model.json) is the shared source of elements, relationships, descriptions and view positions. [render-c4.ts](../../scripts/render-c4.ts) generates SVGs, converts them to PNG with Sharp and exports levels 1–3 to [Structurizr DSL](workspace.dsl). Manual positions apply to SVG/PNG; DSL uses its own automatic layout. Level 4 remains an image of selected classes rather than a simulated native DSL code view.

From the project root:

```sh
npm ci
npm run docs:c4
```

No remote service, Graphviz, Docker or Java is used. The renderer validates IDs, relationship endpoints, box boundaries and text size. After editing the model, regenerate images, inspect them visually and version the model, SVGs, PNGs and DSL together.

Images are 1,600 pixels wide. Segoe UI is preferred, with system fallback; installed fonts may change rasterization. Model and routes are reproducible without promising identical PNGs across different font environments.

## Interpretation

- Blue denotes internal elements; gray denotes external people/systems; green denotes file storage.
- The level-1 dashed Ollama relationship is optional and inactive in Lambda.
- At level 4, a pale dashed box is an interface, dashed arrows mean implementation, and yellow boxes denote experimental indexes.
- C4 containers are execution/storage units, not necessarily Docker containers.
- Storage represents ingestion snapshots and server-distributed `corpus.json`; Lambda does not read the entire snapshot archive on every query.
- Arrows indicate use/dependency or reads/writes. Network responses follow the same path; there is no separate return arrow for each call.

The model replaces an initial drawing that separated MCP/retrieval into processes and placed embeddings in the worker. This documents [runtime.ts](../../apps/mcp-server/src/runtime.ts), not an executable architecture change. Rationale: [ADR-0001](../adr/0001-modular-monolith.md), [ADR-0002](../adr/0002-manual-vector-index.md), [ADR-0007](../adr/0007-embedding-adapters.md) and [ADR-0011](../adr/0011-validation-facade.md).
