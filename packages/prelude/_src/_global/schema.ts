import * as NsSchema from '@effect/schema/Schema'
import type { Schema as TypeSchema } from '@effect/schema/Schema'

export const Schema = NsSchema
export type Schema<From, To = From> = TypeSchema<From, To>
