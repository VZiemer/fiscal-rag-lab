import type { StandardSchemaWithJSON } from '@modelcontextprotocol/server';
import type { Schema, JsonSchemaTarget } from '../../../packages/validation/src/schema.js';

/** Translate the project's validation API to the SDK's vendor-neutral Standard Schema protocol. */
export function toMcpSchema<T>(schema: Schema<T>): StandardSchemaWithJSON<unknown, T> {
  const target = (value: string): JsonSchemaTarget => {
    if (value !== 'draft-07' && value !== 'draft-2020-12' && value !== 'openapi-3.0') throw new Error('Unsupported JSON Schema target');
    return value;
  };
  return {
    '~standard': {
      version: 1,
      vendor: 'fiscal-rag-lab',
      validate(value) {
        const result = schema.safeParse(value);
        return result.success ? { value: result.data } : { issues: result.issues };
      },
      jsonSchema: {
        input: options => schema.toJsonSchema({ io: 'input', target: target(options.target) }),
        output: options => schema.toJsonSchema({ io: 'output', target: target(options.target) })
      }
    }
  };
}
