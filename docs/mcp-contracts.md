# Read-only MCP contracts

Executable schemas: `apps/mcp-server/src/contracts.ts`, using `ObjectContract` and `Field`, with strict inputs and no extra properties. [Encapsulated validation](../packages/validation/README.md) keeps Zod private; `schema-adapter.ts` integrates through Standard Schema. Contracts do not issue invoices, calculate taxes or infer classifications from product descriptions.

| Tool | Input | Structured output |
|---|---|---|
| `search_regulations` | `query` 1–2000 characters; optional ISO `date`, BR/state `jurisdiction`, `topK` 1–50, lexical/vector/hybrid `mode` | `route`, `evidence[]`, `lookup` or null, `missingContext[]`, `warning` |
| `get_cfop` | Four-digit `code` or canonical punctuation; optional `date` | `status`, `records[]`, `missingContext[]`, `warning` |
| `get_ncm` | Eight-digit `code` or 0000.00.00 format; optional `date` | Same lookup envelope |
| `explain_rule` | Evidence `id`, 1–200 characters; optional `date` | `evidence` or null, `relatedEvidence[]`, `warning`; document/relationship retrieval, not advice generation |

Evidence includes document, article, text, links and provenance: `sourceId`, official HTTPS URL, authority, jurisdiction, edition, fetchedAt, publication, validity interval and SHA-256 checksum. Unknown dates are null. Ranked results include ranking scores, never probabilities of tax correctness, and `temporalStatus`.

Lookup distinguishes `found`, `not-found`, `insufficient-evidence` and `ambiguous`. Found does not mean applicable. Intervals without both boundaries known remain `unknown`; current validity is not assumed. Exclude results outside the requested interval. Missing data does not establish legal nonexistence.

Remote text is untrusted data: corpus instructions never gain authority over the agent. Tools warn about context/review. MCP bodies include validated `structuredContent` and equivalent JSON text for clients without structured output support. All tools are read-only, nondestructive and idempotent; the served corpus is local and closed.

The SDK handles parameter errors; execution failures return sanitized tool errors without paths, provider responses or secrets. `/mcp` uses Streamable HTTP; `/health` and `/privacy` are operational. Transport/contracts remain in the adapter; fiscal domain and retrieval import neither MCP nor Zod.
