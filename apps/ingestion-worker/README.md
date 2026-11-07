# Snapshot ingestion

`npm run ingest -- source.json .data/sources` downloads an official HTTPS URL without following redirects. Input JSON contains `sourceId`, `sourceUrl`, `authority`, `jurisdiction`, `edition`, `publishedAt`, `validFrom` and `validTo`; unknown dates are `null`. Date fields use ISO format. Default limits: 20 MiB and 30 seconds. The catalog under `docs/` contains discovery indexes; it does not replace this edition manifest.

Bytes are addressed by SHA-256. Observations retain separate timestamps; repeating the same observation is idempotent. Failed requests do not publish metadata. Parsers must reject error pages and validate schemas before indexing. Do not infer validity from download time.

Source content is *untrusted*; keep it out of privileged instructions, and do not commit downloaded documents by default.

## Build the served corpus

`npm run corpus:build -- manifest.json .data/corpus.json` connects snapshots to parsers and the chunker. The manifest uses `{version:1,snapshots:[{metadataFile:"sources/id/hash-observation.json",format:"cfop-xlsx"}]}`. Metadata paths are relative to the manifest; source bytes are located by hash next to the metadata. Formats: `cfop-xlsx`, `ncm-json` and `legal-text` (which requires `documentId`). The worker verifies hash and size before reading, validates duplicates and relationships, and writes output through atomic replacement. A failed input preserves the previous corpus.

`legal-text` accepts plain UTF-8 text, not PDF or HTML. Extraction and review of those formats still require dedicated adapters; do not pass an error page as legal text. The MCP runtime reads the resulting corpus through `MCP_CORPUS`. Embeddings are computed at runtime startup without modifying sources.
