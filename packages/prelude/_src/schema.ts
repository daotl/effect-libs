import type { ParseOptions } from '@effect/schema/AST'

export type SelfValidatingSchema<From, To = From> = Schema<From, To> & {
  validate: (a: unknown, options?: ParseOptions) => To
}

export const toSelfValidatingSchema = <From, To = From>(
  s: Schema<From, To>,
): SelfValidatingSchema<From, To> => ({
  ...s,
  validate: Schema.validate(s),
})
