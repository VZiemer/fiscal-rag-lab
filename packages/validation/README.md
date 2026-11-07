# Validation contracts

The application declares fields with `ObjectContract` and `Field`. Zod is a private implementation detail of `src/schema.ts`; its types and errors are not part of the public API.

```ts
const searchInput = new ObjectContract({
  query: Field.text({ trim: true, minLength: 1, maxLength: 2000 }),
  topK: Field.integer({ min: 1, max: 50 }).optional(),
  mode: Field.choice(['lexical', 'vector', 'hybrid']).optional()
});

const input = searchInput.parse(receivedJson);
// input.query is a string; topK and mode are optional and typed.
```

`ObjectContract` rejects extra fields by default. Limits use named options for readability without chaining library methods. Composite contracts reuse fields through `...otherContract.fields` or accept another contract as a field.

| Operation | Result |
|---|---|
| `parse(value)` | Returns validated data or throws `ValidationError`. |
| `safeParse(value)` | Returns `{success: true, data}` or `{success: false, issues}`. |
| `optional()` | Allows absence/`undefined`; does not itself allow `null`. |
| `nullable()` | Allows `null`; does not make the field optional. |
| `withDefault(value)` | Fills missing values while retaining required output types and independent copies of lists/objects. |
| `toJsonSchema({io, target})` | Describes the data shape for clients and documentation. |
| `Infer<typeof contract>` | Infers the TypeScript type of validated output. |

`Field` provides only the formats used by this project: text, number, integer, URL, timestamp, enum, literal, list and union. `check` adds validation such as calendar-date correctness. These checks still run at runtime even when JSON Schema cannot express them. A TypeScript interface alone does not validate JSON received over the network.

The [MCP adapter](../../apps/mcp-server/src/schema-adapter.ts) converts `Schema<T>` to Standard Schema, the interface accepted by the installed SDK. It provides validation and input/output JSON Schemas. The validation package does not import MCP, and the server does not need to import Zod.

RAG client plans and evaluation experiment responses use the same API. Errors expose only `message` and `path`, without requiring consumers to understand `ZodError`. Exact validation wording is not a stable contract; applications should use `ValidationError` and field paths. Tool errors remain sanitized by the server.

Zod remains installed as the internal engine and is also an MCP SDK dependency. This abstraction isolates coupling in consumer code; it does not remove the library from the dependency tree. Replacing the engine requires adapting this module while preserving validation, inferred types and JSON Schema under the same tests.

`npm run check:boundaries` prevents Zod imports outside `src/schema.ts`. `npm test` checks invalid inputs, nested objects, defaults, tool plans, TypeScript inference and MCP calls under both protocol negotiations. Architectural decision: [ADR-0011](../../docs/adr/0011-validation-facade.md).
