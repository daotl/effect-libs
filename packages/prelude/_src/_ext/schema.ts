import * as S from '@effect/schema/Schema'
import type { AST, PropertySignature } from '@effect/schema/AST'
import { $R } from '../_global/remeda.js'

/**
 * @tsplus type effect/schema/Schema
 */
// biome-ignore lint/suspicious/noExplicitAny: ignore
export type Any<R = never> = S.Schema<any, any, R>

export type StructArgs<R = never> = Record<
  string,
  // any
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  Any<R> | S.PropertySignature<any, boolean, any, boolean, R>
>

/**
 * @tsplus type effect/schema/Schema
 */
export type Struct<
  R = never,
  Fields extends StructArgs<R> = StructArgs<R>,
> = ReturnType<typeof S.struct<Fields>>

/**
 * @tsplus type effect/schema/Schema
 */
export type Nullable<A, I, R> = ReturnType<typeof S.nullable<A, I, R>>

/**
 * @tsplus type effect/schema/Schema
 */
export type Optional<A, I, R> = ReturnType<typeof S.optional<A, I, R>>

/**
 * @tsplus type effect/schema/Schema
 */
export type OptionalOrUndefined<A, I, R> = Optional<
  A | undefined,
  I | undefined,
  R
>

/**
 * @tsplus type effect/schema/Schema
 */
export type Nullish<A, I, R> = Optional<Nullable<A, I, R>, Nullable<A, I, R>, R>

/**
 * @tsplus type effect/schema/Schema
 */
export type NullishOrUndefined<A, I, R> = Nullish<
  A | undefined,
  I | undefined,
  R
>

// Make properties of the specified keys or all keys nullable
/**
 * @tsplus type effect/schema/Schema
 */
export type NullableProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  R,
  Key extends keyof A = keyof A,
> = Struct<
  R,
  {
    [K in keyof A]: K extends Key ? Nullable<R, I[K], A[K]> : A[K]
  }
>

// Make properties of the specified keys or all keys optional
/**
 * @tsplus type effect/schema/Schema
 */
export type OptionalProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  R,
  Key extends keyof A = keyof A,
> = Struct<
  R,
  {
    [K in keyof A]: K extends Key ? Optional<I[K], A[K], R> : A[K]
  }
>

// Make properties of the specified keys or all keys nullish
/**
 * @tsplus type effect/schema/Schema
 */
export type NullishProperties<
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  R,
  Key extends keyof A = keyof A,
> = Struct<
  R,
  {
    [K in keyof A]: K extends Key ? Nullish<I[K], A[K], R> : A[K]
  }
>

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
export const getPropertySchemas = <R, I extends { [K in keyof A]: any }, A>(
  schema: S.Schema<R, I, A>,
): { [K in keyof A]: S.Schema<R, I[K], A[K]> } => {
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  const out: Record<PropertyKey, S.Schema<R, any>> = {}
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
export const optionalOrUndefined = <_S extends Any>(s: _S) =>
  S.optional(S.union(s, S.undefined))

// Make properties of the specified keys or all keys nullable
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullableProperties
 */
export const nullableProperties = <
  R,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<R, I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.nullable(v) : v,
    ),
  ) as NullableProperties<A, I, R, Key>

// Make properties of the specified keys or all keys optional
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema optionalProperties
 */
export const optionalProperties = <
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  R,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<R, I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.optional(v) : v,
    ),
  ) as OptionalProperties<A, I, R, Key>

// Make properties of the specified keys or all keys nullish
// Ref: https://github.com/Effect-TS/schema/blob/9cdb0ea2227ac6efcad68587268c9ef80423c309/src/S.ts#L705
/**
 * @tsplus static effect/schema/Schema nullishProperties
 */
export const nullishProperties = <
  R,
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  I extends { [K in keyof A]: any },
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  A extends Record<string, any>,
  Key extends keyof A = keyof A,
>(
  schema: S.Schema<R, I, A>,
  keys?: Key[],
) =>
  S.struct(
    $R.mapValues(getPropertySchemas(schema), (v, k) =>
      !keys || (keys as (keyof A)[]).includes(k) ? S.nullish(v) : v,
    ),
  ) as NullishProperties<A, I, R, Key>
