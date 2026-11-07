# ADR-0011: Project-owned contracts and Zod encapsulation

- Status: **Accepted**
- Date: 2026-11-14
- Refines: [ADR-0008](0008-mcp-runtime.md)

## Context

MCP contracts, the query client and behavior evaluation imported Zod directly. Declarations accumulated chained methods, and consumers depended on `ZodType`, `z.infer` and library errors. The user requested a class abstraction for readability and dependency encapsulation.

## Decision

`packages/validation/src/schema.ts` provides `Schema<T>`, `ObjectContract`, `Field`, `Infer` and `ValidationError`. Fields use named options. Objects are strict by default, with field composition, optional/nullable values, defaults and additional checks. Zod objects live in a private `WeakMap`; public types and compiled declarations do not export vendor types.

Zod remains the validation and JSON Schema engine, preserving existing formats without creating another parsing engine. The facade contains only currently needed operations rather than reproducing the entire Zod API.

Installed MCP SDK 2.4.0 accepts Standard Schema with JSON conversion. `apps/mcp-server/src/schema-adapter.ts` adapts project contracts to that interface. Validation does not depend on the SDK; contracts/server/scripts/evaluation do not import Zod. The boundary checker restricts that import to one file.

## Consequences and verification

Replacing the engine is localized to the facade but must preserve contracts/tests. Zod remains a runtime and transitive SDK dependency; this decision does not promise complete removal.

The client uses a union of four strict contracts with literal tool names, preserving the name/argument association at runtime and in TypeScript inference. Sequential attempts have bounded cost for four variants; exposing a vendor-specific discriminated-union feature was unnecessary.

Input/output JSON Schemas for the nine existing contracts were compared before/after and remained identical. Local errors become `ValidationError`; exact message text is not a stable API. Tests cover extra fields, invalid dates, limits, defaults, public types, restricted plans and modern/earlier HTTP MCP integration. Calendar checks not expressible in JSON Schema still execute through the Standard Schema bridge.
