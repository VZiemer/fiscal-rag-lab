import { z } from 'zod';

export interface ValidationIssue {
  readonly message: string;
  readonly path: readonly PropertyKey[];
}
export type ValidationResult<T> = { success: true; data: T } | { success: false; issues: readonly ValidationIssue[] };
export type JsonSchemaTarget = 'draft-2020-12' | 'draft-07' | 'openapi-3.0';
export interface JsonSchemaOptions { target?: JsonSchemaTarget; io?: 'input' | 'output' }
interface Validator<T> {
  validate(value: unknown): ValidationResult<T>;
  jsonSchema(options: JsonSchemaOptions): Record<string, unknown>;
}

export class ValidationError extends Error {
  constructor(readonly issues: readonly ValidationIssue[]) {
    super(issues.map(issue => `${issue.path.map(String).join('.') || '$'}: ${issue.message}`).join('; '));
    this.name = 'ValidationError';
  }
}

// Keep vendor objects private: consumers only see project-owned schemas, results and errors.
const engines = new WeakMap<Schema<unknown>, z.ZodType>();
function engine<T>(schema: Schema<T>): z.ZodType<T> {
  const value = engines.get(schema);
  if (!value) throw new Error('Unsupported schema implementation');
  return value as z.ZodType<T>;
}
function validator<T>(schema: z.ZodType<T>): Validator<T> {
  return {
    validate(value) {
      const result = schema.safeParse(value);
      return result.success ? { success: true, data: result.data }
        : { success: false, issues: result.error.issues.map(issue => ({ message: issue.message, path: [...issue.path] })) };
    },
    jsonSchema({ target = 'draft-07', io = 'input' }) {
      return schema['~standard'].jsonSchema[io]({ target });
    }
  };
}

/** Small validation facade; it deliberately exposes only operations used by this project. */
export abstract class Schema<T> {
  protected constructor(private readonly validator: Validator<T>) {}
  parse(value: unknown): T {
    const result = this.safeParse(value);
    if (!result.success) throw new ValidationError(result.issues);
    return result.data;
  }
  safeParse(value: unknown): ValidationResult<T> { return this.validator.validate(value); }
  toJsonSchema(options: JsonSchemaOptions = {}): Record<string, unknown> { return this.validator.jsonSchema(options); }
  optional(): Schema<T | undefined> { return new ValueSchema(engine(this).optional()); }
  nullable(): Schema<T | null> { return new ValueSchema(engine(this).nullable()); }
  withDefault(value: Exclude<T, undefined>): Schema<Exclude<T, undefined>> {
    // A factory isolates mutable defaults between parses and from the caller's original value.
    const copy = structuredClone(value);
    return new ValueSchema(engine(this).default(() => structuredClone(copy)));
  }
}

class ValueSchema<T> extends Schema<T> {
  constructor(schema: z.ZodType<T>) {
    super(validator(schema));
    engines.set(this, schema);
  }
}

export type Infer<S extends Schema<unknown>> = S extends Schema<infer T> ? T : never;
type Fields = Readonly<Record<string, Schema<unknown>>>;
type OptionalKeys<S extends Fields> = { [K in keyof S]: undefined extends Infer<S[K]> ? K : never }[keyof S];
type ObjectValue<S extends Fields> = { [K in Exclude<keyof S, OptionalKeys<S>>]: Infer<S[K]> }
  & { [K in OptionalKeys<S>]?: Infer<S[K]> };

/** Object contracts reject unknown properties, including in nested objects. */
export class ObjectContract<S extends Fields> extends Schema<ObjectValue<S>> {
  readonly fields: Readonly<S>;
  constructor(fields: S) {
    const shape = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, engine(value)]));
    // The mapped type above mirrors required/optional fields; the vendor shape stays internal.
    const schema = z.object(shape).strict() as z.ZodType<ObjectValue<S>>;
    super(validator(schema));
    engines.set(this, schema);
    this.fields = Object.freeze({ ...fields });
  }
}

export interface TextOptions {
  trim?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  check?: (value: string) => boolean;
  message?: string;
}
export interface NumberOptions { min?: number; max?: number }
export interface ListOptions { minItems?: number; maxItems?: number }

/** Named options replace vendor-specific chains at contract declarations. */
export class Field {
  static text(options: TextOptions = {}): Schema<string> {
    let schema = z.string();
    if (options.trim) schema = schema.trim();
    if (options.minLength !== undefined) schema = schema.min(options.minLength);
    if (options.maxLength !== undefined) schema = schema.max(options.maxLength);
    if (options.pattern) schema = schema.regex(options.pattern);
    if (options.check) schema = schema.refine(options.check, options.message);
    return new ValueSchema(schema);
  }
  static number(options: NumberOptions = {}): Schema<number> { return Field.numeric(false, options); }
  static integer(options: NumberOptions = {}): Schema<number> { return Field.numeric(true, options); }
  private static numeric(integer: boolean, options: NumberOptions): Schema<number> {
    let schema = z.number();
    if (integer) schema = schema.int();
    if (options.min !== undefined) schema = schema.min(options.min);
    if (options.max !== undefined) schema = schema.max(options.max);
    return new ValueSchema(schema);
  }
  static url(): Schema<string> { return new ValueSchema(z.url()); }
  static timestamp(): Schema<string> { return new ValueSchema(z.iso.datetime()); }
  static choice<const T extends readonly [string, ...string[]]>(values: T): Schema<T[number]> {
    return new ValueSchema(z.enum(values));
  }
  static literal<const T extends string>(value: T): Schema<T> { return new ValueSchema(z.literal(value)); }
  static list<T>(item: Schema<T>, options: ListOptions = {}): Schema<T[]> {
    let schema = z.array(engine(item));
    if (options.minItems !== undefined) schema = schema.min(options.minItems);
    if (options.maxItems !== undefined) schema = schema.max(options.maxItems);
    return new ValueSchema(schema);
  }
  static union<const S extends readonly [Schema<unknown>, Schema<unknown>, ...Schema<unknown>[]]>(variants: S): Schema<Infer<S[number]>> {
    return new ValueSchema(z.union(variants.map(schema => engine(schema)))) as Schema<Infer<S[number]>>;
  }
}
