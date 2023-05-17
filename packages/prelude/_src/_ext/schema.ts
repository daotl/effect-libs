import * as S from '@effect/schema/Schema'
import * as AST from '@effect/schema/AST'

/**
 * @tsplus type effect/schema/Schema
 */
// rome-ignore lint/suspicious/noExplicitAny: ignore
export type Any = Schema<any>

export type StructArgs = Parameters<typeof S.struct>[0]

/**
 * @tsplus type effect/schema/Schema
 */
export type Struct<Fields extends StructArgs> = ReturnType<
  typeof S.struct<Fields>
>

/**
 * @tsplus type effect/schema/Schema
 */
export type Nullable<From, To = From> = ReturnType<typeof S.nullable<From, To>>

/**
 * @tsplus type effect/schema/Schema
 */
export type Optional<From, To = From> = ReturnType<typeof S.optional<From, To>>

// Nullish<From, To> = Optional<Nullable<From, To>>
/**
 * @tsplus type effect/schema/Schema
 */
export type Nullish<From, To = From> = Optional<Nullable<From, To>>

// Make properties of the specified keys or all keys nullable
/**
 * @tsplus type effect/schema/Schema
 */
export type NullableProperties<
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Nullable<I[K], A[K]> : A[K]
}>

// Make properties of the specified keys or all keys optional
/**
 * @tsplus type effect/schema/Schema
 */
export type OptionalProperties<
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Optional<I[K], A[K]> : A[K]
}>

// Make properties of the specified keys or all keys nullish
/**
 * @tsplus type effect/schema/Schema
 */
export type NullishProperties<
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Nullish<I[K], A[K]> : A[K]
}>

// From: https://github.com/Effect-TS/schema/releases/tag/v0.18.0
// rome-ignore lint/suspicious/noExplicitAny: ignore
export const getPropertySchemas = <I extends { [K in keyof A]: any }, A>(
  schema: S.Schema<I, A>,
): { [K in keyof A]: S.Schema<I[K], A[K]> } => {
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  const out: Record<PropertyKey, S.Schema<any>> = {}
  const propertySignatures = AST.getPropertySchemas(schema.ast)
  for (let i = 0; i < propertySignatures.length; i++) {
    const propertySignature = propertySignatures[i]
    // rome-ignore lint/style/noNonNullAssertion: ignore
    out[propertySignature!.name] = S.make(propertySignature!.type)
  }
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  return out as any
}

/**
 * @tsplus static effect/schema/Schema nullish
 */
export const nullish = flow(S.nullable, S.optional)

// Make properties of the specified keys or all keys nullable
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullableProperties
 */
export const nullableProperties = <
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.nullable(v) : v,
    ),
  ) as NullableProperties<I, A, Key>

// Make properties of the specified keys or all keys optional
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema optionalProperties
 */
export const optionalProperties = <
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.optional(v) : v,
    ),
  ) as OptionalProperties<I, A, Key>

// Make properties of the specified keys or all keys nullish
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullishProperties
 */
export const nullishProperties = <
  // rome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  A extends StructArgs,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? nullish(v) : v,
    ),
  ) as NullishProperties<I, A, Key>
