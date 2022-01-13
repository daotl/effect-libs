// tracing: off

import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import { pipe } from "@effect-ts/core/Function"

import * as S from "../_schema"
import * as Arbitrary from "../Arbitrary"
import * as Encoder from "../Encoder"
import * as Guard from "../Guard"
import * as Th from "../These"
import { chunk } from "./chunk"
import type { DefaultSchema } from "./withDefaults"
import { withDefaults } from "./withDefaults"

export const arrayIdentifier = S.makeAnnotation<{ self: S.SchemaUPI }>()

export function array<ParsedShape, ConstructorInput, Encoded, Api>(
  self: S.Schema<unknown, ParsedShape, ConstructorInput, Encoded, Api>
): DefaultSchema<
  unknown,
  readonly ParsedShape[],
  readonly ParsedShape[],
  readonly Encoded[],
  { self: Api }
> {
  const guardSelf = Guard.for(self)
  const arbitrarySelf = Arbitrary.for(self)
  const encodeSelf = Encoder.for(self)

  const fromChunk = pipe(
    S.identity(
      (u): u is readonly ParsedShape[] => Array.isArray(u) && u.every(guardSelf)
    ),
    S.parser((u: Chunk.Chunk<ParsedShape>) => Th.succeed(Chunk.toArray(u))),
    S.encoder((u): Chunk.Chunk<ParsedShape> => Chunk.from(u)),
    S.arbitrary((_) => _.array(arbitrarySelf(_)))
  )

  return pipe(
    chunk(self)[">>>"](fromChunk),
    S.mapParserError((_) => (Chunk.unsafeHead((_ as any).errors) as any).error),
    S.constructor((_: readonly ParsedShape[]) => Th.succeed(_)),
    S.encoder((u) => u.map(encodeSelf)),
    S.mapApi(() => ({ self: self.Api })),
    withDefaults,
    S.annotate(arrayIdentifier, { self })
  )
}