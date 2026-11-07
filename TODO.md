# Verifiable pending work

## External access or decisions required

- [x] Deploy on AWS with S3/CloudFront, HTTP API and Lambda. HTTPS/tools verified by an official remote MCP client; credentials and personal contact remain outside Git.
- [x] Download/load official CFOP/NCM editions and national/SP/MG legislation. Per-source report: `docs/data/official-corpus.json`; local bytes outside Git. Human tax review and historical coverage remain pending.
- [ ] Install/test Fiscal RAG Lab in ChatGPT Work. Plugin Creator is available and the private plugin exists; skill/endpoint were confirmed in saved files. Browser/UI control failed at startup (`setup refresh had errors`); in-product testing awaits functional access.
- [x] Register `fiscal_rag_lab` on the Codex host; CLI confirmed enablement/URL. Refresh the catalog to verify native conversation calls; do not describe that as completed Work testing.
- [ ] Record a ChatGPT Work demo and submit through the portal with an authorized account and real materials. Public contact/policy, Brazil availability and free/no-payment behavior are confirmed. Legal attestations require the authorized developer. The plugin remains private and unsubmitted.
- [ ] LoRA and answer comparison remain pending at the user's direction. This host has no configured Python, Docker or nvidia-smi in PATH; no training was executed.

## Addressable improvements

- [ ] Improve initial SP→MG hardware retrieval: broad resale queries ranked returns/transfers above the relevant candidate; never pick CFOP solely from the top result. Retrieve explicit interstate-group support, applicable ST protocols/rules and provision-level validity. The contract in `eval/scenarios/initial-hardware-sale.json` does not certify tax applicability.
- [ ] Separate/filter historical CONFAZ wording by provision validity. Initial results included historical dates in text while consolidation provenance had unknown boundaries; do not treat them as current rules.
- [ ] Review the SP section omitted for corrupted characters through a separately authorized maintenance workflow. Never infer missing text or claim complete book/annex coverage. See `docs/official-ingestion.md`.
- [ ] Implement schema-specific parsers for downloaded NCM/uTrib and cClassTrib IBS/CBS spreadsheets. Extract/review MOC 7 PDF tables against later technical notes before indexing. Archiving is not RAG availability.
- [ ] Expand individual SP/MG acts and federal rules by use case, keeping other states outside scope. Schedule updates only after defining a difference-review policy.
- [ ] Evaluate RAG-only behavior in the host: cite returned evidence only and refuse web/memory fallback for unsupported questions. Private skill 0.1.1 is saved and project web search disabled; this is neither complete tool isolation nor semantic claim validation.
- [ ] Review Lambda concurrency quotas before reserving capacity. Reservation of 2 was rejected because at least 10 unreserved executions are required; deployment uses HTTP API throttling/shared concurrency without changing existing resources.
- [ ] Measure process-isolated memory, variance and IVF serialized size; replace HNSW sorted queues with heaps if profiles justify it.
- [ ] Partition indexes temporally/by jurisdiction to filter without scanning every candidate.
- [ ] Review edition-specific redistribution licenses and obtain human fiscal benchmark review.
