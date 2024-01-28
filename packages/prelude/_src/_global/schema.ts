import * as S from '@effect/schema/Schema'
import * as Ext from '../_ext/schema.js'

export type Schema<out R, in out From, in out To = From> = S.Schema<R, From, To>

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

  export type Nullable<R, From, To = From> = Ext.Nullable<R, From, To>

  export type Optional<R, From, To = From> = Ext.Optional<R, From, To>

  export type Nullish<R, From, To = From> = Ext.Nullish<R, From, To>

  export type NullableProperties<
    R,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.NullableProperties<R, I, A, Key>

  export type OptionalProperties<
    R,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.OptionalProperties<R, I, A, Key>

  export type NullishProperties<
    R,
    // biome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.NullishProperties<R, I, A, Key>
}

export const Schema = {
  ...S,
  /* Custom utils */
  getPropertySchemas: Ext.getPropertySchemas,
  nullableProperties: Ext.nullableProperties,
  optionalProperties: Ext.optionalProperties,
  nullishProperties: Ext.nullishProperties,
}
