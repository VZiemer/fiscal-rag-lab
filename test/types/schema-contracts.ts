import { Field, ObjectContract, type Infer } from '../../dist/packages/validation/src/schema.js';
import { type RagToolCall, searchInput } from '../../dist/apps/mcp-server/src/contracts.js';
import { behaviorResponseSchema } from '../../dist/packages/evaluation/src/behavior.js';

const minimal: Infer<typeof searchInput> = { query: 'metal' };
const mode: 'lexical' | 'vector' | 'hybrid' | undefined = searchInput.parse(minimal).mode;
// @ts-expect-error Query remains required.
const missing: Infer<typeof searchInput> = {};
// @ts-expect-error Enumerations must not widen to arbitrary strings.
const unsupported: Infer<typeof searchInput> = { query: 'metal', mode: 'external' };
const response = behaviorResponseSchema.parse({ action: 'abstain' });
const citations: string[] = response.citations;
const action: 'lookup_cfop' | 'lookup_ncm' | 'search' | 'clarify' | 'abstain' | 'answer' = response.action;

const contract = new ObjectContract({ text: Field.text().nullable(), count: Field.integer().optional() });
const nullable: Infer<typeof contract> = { text: null };
// @ts-expect-error Nullable is not the same as optional.
const omitted: Infer<typeof contract> = {};
// @ts-expect-error Numeric output must not become unknown or any.
const invalidCount: Infer<typeof contract> = { text: 'x', count: '2' };

function verifyCall(call: RagToolCall): void {
  if (call.name === 'get_ncm') {
    const code: string = call.arguments.code;
    // @ts-expect-error Discriminating the tool name must narrow its arguments.
    const query = call.arguments.query;
  }
}
void [minimal, mode, citations, action, nullable, verifyCall];
