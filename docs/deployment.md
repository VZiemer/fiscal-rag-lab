# HTTPS deployment preparation

Implemented and tested locally: `/mcp`, `/health`, `/privacy`, 60 requests/minute per source connection, 600/minute globally, 16 concurrent requests, 64 KiB bodies, Host/Origin validation and logs without query content. Quotas count HTTP calls, including negotiation and tool listing.

Deployed to AWS on 2026-11-14: [HTTPS MCP](https://d2kvl1uo6lcsgz.cloudfront.net/mcp), [readiness](https://d2kvl1uo6lcsgz.cloudfront.net/health) and [privacy](https://d2kvl1uo6lcsgz.cloudfront.net/privacy). Private S3 + CloudFront + HTTP API + Node 22 Lambda. An official remote MCP client verified all four tools under earlier and modern negotiations. Implementation/instructions: `deploy/aws/`. Authorized operator contact appears only in local/published artifacts, not Git.

The Docker package below is an unused alternative: Docker was not installed on this host and the image was not built. AWS uses official NCM/CFOP tables and selected national/SP/MG documents without learned embeddings. Counts, hashes and limits: [official load](official-ingestion.md). Unverified validity stays unknown; coverage is incomplete.

For Linux with Docker Compose and configured DNS:

1. Review and assemble a public corpus at `.data/public-corpus/corpus.json`. Do not publish synthetic fixtures as real rules.
2. Set `FISCAL_DOMAIN` in the operator environment. Run `docker compose -f deploy/compose.yaml up --build -d`. Caddy requests TLS; the API exposes no direct port.
3. Check `/health`, `/privacy` and contracts with a remote MCP client. Review infrastructure logging and disclose operator contact before public access.
4. Pin image digests after platform/architecture validation; record Git revision, corpus hash and parameters. Never commit certificates, tokens or private fiscal data.

Source limits use socket addresses, ignoring `X-Forwarded-For`. A proxy shares that limit; global quotas prevent multiplication. Real per-client segmentation requires authentication or an explicitly trusted proxy policy. Never mount private data in this unauthenticated demo.

Application logs include only random ID, categorized route, status and duration. Compose rotates by size, not retention period. Caddy does not enable access logs; infrastructure may keep its own records and requires review. `/privacy` describes the prototype without inventing operator identity/contact.

Rollback to the previous image and immutable corpus. Readiness is exposed only after loading/indexing; loading failures prevent startup. Compose does not include Ollama; offline lexical control is the default.
