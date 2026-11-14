# ADR-0003: Expose application capabilities via read-only MCP tools

- Status: **Accepted**
- Date: 2026-11-14

## Context

We want interactive ChatGPT demos without depending on one proprietary chatbot interface. Skills are reusable instructions; they do not replace servers that perform search.

## Decision

Implement a remote Streamable HTTP MCP adapter with read-only tools (`search_regulations`, `get_cfop`, `get_ncm`, later `validate_operation`). Each tool delegates to application services and returns structured source evidence. Follow the official MCP transport and authentication requirements; use the protocol SDK initially only for the transport layer if implementing JSON-RPC/handshake ourselves would distract from retrieval, documenting that trade-off separately.

## Consequences

+ ChatGPT/other MCP clients can share the same backend.
+ Tool calls are observable and contract-testable.
- HTTPS, availability, authorization and review requirements arise when publicly distributing the plugin.

## Alternatives

OpenAPI GPT Actions (legacy, tied to custom GPT product); chat-only upload knowledge (not an independently inspectable retrieval implementation).
