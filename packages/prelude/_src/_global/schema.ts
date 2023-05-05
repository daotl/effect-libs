import * as NsSchema from '@effect/schema/Schema'
import type { Schema as TypeSchema } from '@effect/schema/Schema'

export type Schema<From, To = From> = TypeSchema<From, To>

export namespace Schema {
  export type From<
    S extends {
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      readonly From: (..._: any) => any
    },
  > = NsSchema.From<S>

  export type To<
    S extends {
      // rome-ignore lint/suspicious/noExplicitAny: ignore
      readonly To: (..._: any) => any
    },
  > = NsSchema.To<S>
}

export const Schema = NsSchema
