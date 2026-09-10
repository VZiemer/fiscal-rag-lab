# ADR-0001: Modular monolith with ports and adapters

- Status: **Proposed**
- Date: 2026-11-14

## Context

This is a one-developer learning project. Premature service decomposition would distract from vector search and domain modeling. We also want to use more than one agent and embedding provider.

## Decision

Use TypeScript/Node.js with clean module boundaries and ports/adapters. Domain and retrieval code cannot import MCP, HTTP, a model provider or vendor SDK. Run ingestion separately as a CLI worker; deploy only the MCP gateway when remote access is needed.

## Consequences

+ Low initial operational cost; tests can run without an LLM.
+ Independent adapters support ChatGPT, CLI, and other clients.
- Runtime and build tooling may need adjustment if workload becomes CPU-intensive.

## Alternatives

Microservices (not initially justified); orchestrator framework as core (hides mechanisms we want to learn).
