# Ingestion worker (planned)

Responsibilities: download authoritative official sources, verify checksums, normalize input formats, extract legal article hierarchy, detect duplicates, attach jurisdiction/publication/effective dates, chunk, embed and update exact/vector indexes. Must be re-runnable and idempotent.

Source content is *untrusted*; keep it out of privileged instructions, and don't commit downloaded documents by default.
