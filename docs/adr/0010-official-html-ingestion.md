# ADR-0010 — Official HTML document extraction

Status: accepted, 2026-11-14.

Use Cheerio 1.1.2 for HTML and iconv-lite 0.7.0 for Windows-1252 decoding, only in the ingestion adapter. Domain, indexes and MCP do not depend on them. Explicit selectors identify Receita Federal, CONFAZ, SEFAZ-SP and SEF-MG content; selector, encoding or integrity failures prevent that document's indexing. Sections with corrupted control characters in the source are omitted and counted, without guessing letters or legal conditions.

Snapshots preserve bytes, URL, SHA-256, observation and known dates. Extraction removes navigation, scripts and explicit revoked-text markup. The full SP selection contains books I–V; selected annexes are separate documents. MG follows only official RICMS/2023 HTML pages without revoked provisions, in the same official directory, with a page limit. There is no general web crawling or external consultation during fiscal answers.

Encoding follows HTTP headers, including Windows-1252 on MG legal pages. Bounded sections avoid quadratic growth of links across large tables. This limits automatic reconstruction across sections: missing dependencies require separately requested source maintenance rather than invented context. Consolidation validity is not inferred from download time. The NCM sentinel 31/12/9999 is retained in notes and converted to an unknown end date.

Redirects are limited to the same government HTTPS origin. Session cookies stay in memory. Auxiliary spreadsheets without parsers are archived and marked unindexed. Updates are not automatic: each run reports coverage; replacing the published corpus requires a build and verification.
