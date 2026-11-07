# Fiscal RAG Lab plugin

The portable package contains `plugin.json`, `mcp.json`, `assets/` and `skills/`. Configuration targets the [deployed HTTPS MCP](https://d2kvl1uo6lcsgz.cloudfront.net/mcp), verified with an official remote client. The corpus contains official NCM/CFOP tables and selected national/SP/MG documents: [coverage](../../docs/official-ingestion.md). For local development, `npm start -- --demo` serves synthetic fixtures at `127.0.0.1:3000`; adjust a configuration copy if needed.

Package with authorized contact: `npm run plugin:prepare -- https://d2kvl1uo6lcsgz.cloudfront.net/mcp .data/plugin-public .data/aws/contact.json`. It requires credential-free HTTPS and copies an allowlist only. Contact/publisher identity enter the generated ignored copy, not Git. Zip the contents of `.data/plugin-public` without parent directories. This command registers no account plugin.

The [official packaging documentation](https://developers.openai.com/plugins/build/plugins), checked on 2026-11-14, specifies portable `mcp.json` and `streamable-http`. There are five positive/three negative cases, icons and public support/privacy/terms URLs. A private account plugin was saved, but Work-session tools, usage video and submission are not complete.

Plugin Creator saved the private version and verified skill/MCP. Work installation remains unconfirmed after UI startup failure. Generated public copies use 512×512 PNGs rendered from original SVGs without modifying the private version. `npm run review:rehearse` checks five positive MCP contracts and saves local evidence; it does not test agent tool selection.

After ZIP generation, `scripts/validate-plugin-archive.ps1` checks actual contents, PNG dimensions, fields, cases and references. Package validity is separate from submission readiness: structure does not supply verified video, explicit countries, host tests or attestations. Publisher details stay only in generated artifacts and the saved account version.

Account privacy verified at version 0.1.2: `USER` / `PRIVATE`, without sharing/publication. AWS is a separate public unauthenticated demo containing public-source documentation only. The user selected `BR` for potential future publication; current private access is unchanged. Free use without purchases/payments is confirmed and recorded as `commerce:false`.

After connection, test exact codes, rule search with date/state, exception retrieval, out-of-validity editions, missing codes and rejection of synthetic fixtures as legislation. Record results/version/date before completing the task. Repository translations do not automatically update the saved account plugin or deployed endpoint.
