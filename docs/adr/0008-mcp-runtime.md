# ADR-0008: Official MCP SDK and boundary validation

- Status: **Accepted**
- Date: 2026-11-14

Use the official TypeScript SDK in the HTTP adapter, with Zod for input/output contracts. Manually implementing JSON-RPC, negotiation and transport would expand the error surface without contributing to retrieval research. The domain retains its own ports.

Refinement in [ADR-0011](0011-validation-facade.md): Zod is encapsulated in the validation module; contracts use project-owned classes and the MCP adapter uses Standard Schema. The library is not part of the API consumed by the application.

The server is stateless, retains no queries and exposes no write tools. Its factory creates per-request instances; never share a connected McpServer across clients. [Official reference](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28): `createMcpHandler` supports modern negotiation and earlier stateless clients. Actual versions are pinned in the lockfile; an independent official client verifies compatibility.
