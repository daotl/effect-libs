import * as S from '@effect/schema/Schema'
import type { AST, PropertySignature } from '@effect/schema/AST'
import { $R } from '../_global/remeda.js'

/**
 * @tsplus type effect/schema/Schema
 */
// biome-ignore lint/suspicious/noExplicitAny: ignore
export type Any = S.Schema<any>

export type StructArgs = Record<
  string,
  // any
  // biome-ignore lint/suspicious/noExplicitAny: ignorex
  Any | S.PropertySignature<any, boolean, any, boolean>
>

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

/**
 * @tsplus type effect/schema/Schema
 */
export type OptionalOrUndefined<From, To = From> = Optional<
  From | undefined,
  To | undefined
>

/**
 * @tsplus type effect/schema/Schema
 */
export type Nullish<From, To = From> = Optional<Nullable<From, To>>

/**
 * @tsplus type effect/schema/Schema
 */
export type NullishOrUndefined<From, To = From> = Nullish<
  From | undefined,
  To | undefined
>

// Make properties of the specified keys or all keys nullable
/**
 * @tsplus type effect/schema/Schema
 */
export type NullableProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Nullable<I[K], A[K]> : A[K]
}>

// Make properties of the specified keys or all keys optional
/**
 * @tsplus type effect/schema/Schema
 */
export type OptionalProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Optional<I[K], A[K]> : A[K]
}>

// Make properties of the specified keys or all keys nullish
/**
 * @tsplus type effect/schema/Schema
 */
export type NullishProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
> = Struct<{
  [K in keyof A]: K extends Key ? Nullish<I[K], A[K]> : A[K]
}>

/**
 * @since 1.0.0
 */
export const getPropertySignatures = (
  ast: AST,
): readonly PropertySignature[] => {
  switch (ast._tag) {
    case 'TypeLiteral':
      return ast.propertySignatures
    case 'Suspend':
      return getPropertySignatures(ast.f())
  }
  throw new Error(`getPropertySignatures: unsupported schema (${ast._tag})`)
}

// From: https://github.com/Effect-TS/schema/releases/tag/v0.18.0
// biome-ignore lint/suspicious/noExplicitAny: ignore
export const getPropertySchemas = <I extends { [K in keyof A]: any }, A>(
  schema: S.Schema<I, A>,
): { [K in keyof A]: S.Schema<I[K], A[K]> } => {
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const out: Record<PropertyKey, S.Schema<any>> = {}
  const propertySignatures = getPropertySignatures(schema.ast)
  for (let i = 0; i < propertySignatures.length; i++) {
    const propertySignature = propertySignatures[i]
    // biome-ignore lint/style/noNonNullAssertion: ignore
    out[propertySignature!.name] = S.make(propertySignature!.type)
  }
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  return out as any
}

/**
 * @tsplus static effect/schema/Schema optionalOrUndefined
 */
export const optionalOrUndefined = (s: Any) =>
  S.optional(S.union(s, S.undefined))

// Make properties of the specified keys or all keys nullable
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullableProperties
 */
export const nullableProperties = <
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.nullable(v) : v,
    ),
  ) as NullableProperties<I, A, Key>

// Make properties of the specified keys or all keys optional
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema optionalProperties
 */
export const optionalProperties = <
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.optional(v) : v,
    ),
  ) as OptionalProperties<I, A, Key>

// Make properties of the specified keys or all keys nullish
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullishProperties
 */
export const nullishProperties = <
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.nullish(v) : v,
    ),
  ) as NullishProperties<I, A, Key>
