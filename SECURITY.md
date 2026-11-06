# Security policy (prototype)

- Do not submit production credentials, private tax records or real invoices in issues or sample data.
- Report security concerns privately to repository maintainers once repository contact details are configured.
- Treat upstream document content as untrusted input (prompt-injection defense).
- The initial MCP surface is read-only; enforce server-side schema validation and rate limits before any public deployment.
- Redact query and PII logs by default; do not persist raw user questions unless explicitly needed and documented.

Revisão do histórico e dos arquivos antes da publicação pública: [procedimentos e resultados](docs/publication-review.md).
