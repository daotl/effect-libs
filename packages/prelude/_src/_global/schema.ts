import * as S from '@effect/schema/Schema'
import * as Ext from '../_ext/schema.js'

export type Schema<in out A, in out I, out R> = S.Schema<A, I, R>

export namespace Schema {
  /* Custom types */

  export type Any = Ext.Any

  export type Struct<
    Fields extends Ext.StructArgs /*Record<
    PropertyKey,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    | S.Schema<any, any>
    | S.Schema<never, never>
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    | S.PropertySignature<any, boolean, any, boolean>
    | S.PropertySignature<never, boolean, never, boolean>
  >,*/,
  > = Ext.Struct<Fields>

  export type Nullable<A, I, R> = Ext.Nullable<A, I, R>

  export type Optional<A, I, R> = Ext.Optional<A, I, R>

  export type Nullish<A, I, R> = Ext.Nullish<A, I, R>

  export type NullableProperties<
    A extends Ext.StructArgs,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    R,
    Key extends keyof A = keyof A,
  > = Ext.NullableProperties<A, I, R, Key>

  export type OptionalProperties<
    R,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.OptionalProperties<A, I, R, Key>

  export type NullishProperties<
    R,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.NullishProperties<A, I, R, Key>
}

export const Schema = {
  ...S,
  /* Custom utils */
  getPropertySchemas: Ext.getPropertySchemas,
  nullableProperties: Ext.nullableProperties,
  optionalProperties: Ext.optionalProperties,
  nullishProperties: Ext.nullishProperties,
}
