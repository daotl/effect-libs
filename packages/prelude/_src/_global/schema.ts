import * as S from '@effect/schema/Schema'
import * as Ext from '../_ext/schema.js'

export type Schema<From, To = From> = S.Schema<From, To>

export namespace Schema {
  export type From<
    S extends {
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      readonly From: (..._: any) => any
    },
  > = S.From<S>

  export type To<
    S extends {
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      readonly To: (..._: any) => any
    },
  > = S.To<S>

  /* Custom types */

  export type Any = Ext.Any

  export type Struct<
    Fields extends Record<
      PropertyKey,
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      | S.Schema<any, any>
      | S.Schema<never, never>
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      | S.PropertySignature<any, boolean, any, boolean>
      | S.PropertySignature<never, boolean, never, boolean>
    >,
  > = Ext.Struct<Fields>

  export type Nullable<From, To = From> = Ext.Nullable<From, To>

  export type Optional<From, To = From> = Ext.Optional<From, To>

  export type Nullish<From, To = From> = Ext.Nullish<From, To>

  export type NullableProperties<
    // rome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.NullableProperties<I, A, Key>

  export type OptionalProperties<
    // rome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.OptionalProperties<I, A, Key>

  export type NullishProperties<
    // rome-ignore lint/suspicious/noExplicitAny: ignore
    I extends { [K in keyof A]: any },
    A extends Ext.StructArgs,
    Key extends keyof A = keyof A,
  > = Ext.NullishProperties<I, A, Key>
}

export const Schema = {
  ...S,
  /* Custom utils */
  nullish: Ext.nullish,
  nullableProperties: Ext.nullableProperties,
  optionalProperties: Ext.optionalProperties,
  nullishProperties: Ext.nullishProperties,
}
