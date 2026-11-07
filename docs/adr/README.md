# Architecture decision records

ADRs 0001–0005 were reviewed and accepted on 2026-11-14: modular monolith, custom algorithms, MCP as an adapter, versioned evidence and evaluation-dependent fine-tuning. Acceptance defines implementation direction; it does not claim deployment or training already occurred. Validity is never inferred automatically, and official texts must not enter Git before redistribution terms are reviewed.

- [0001 – Modular monolith and ports/adapters](0001-modular-monolith.md)
- [0002 – Implement vector indexes ourselves](0002-manual-vector-index.md)
- [0003 – MCP as a transport adapter](0003-mcp-boundary.md)
- [0004 – Versioned legal provenance](0004-versioned-legal-corpus.md)
- [0005 – Fine-tuning deferred until evaluation](0005-fine-tuning-strategy.md)
- [0006 – Parsing libraries in adapters](0006-parsing-and-runtime.md)
- [0007 – Embeddings through a project-owned port](0007-embedding-adapters.md)
- [0008 – Official MCP SDK and boundary validation](0008-mcp-runtime.md)
- [0009 – AWS demo and packaging](0009-aws-demo.md)
- [0010 – Official HTML document extraction](0010-official-html-ingestion.md)
- [0011 – Project-owned contracts and Zod encapsulation](0011-validation-facade.md)
