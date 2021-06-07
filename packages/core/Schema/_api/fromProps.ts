/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Chunk from "@effect-ts/core/Collections/Immutable/Chunk"
import * as Dictionary from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as HashMap from "@effect-ts/core/Collections/Immutable/HashMap"
import { pipe } from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import type { Compute, UnionToIntersection } from "@effect-ts/core/Utils"
import { intersect } from "@effect-ts/core/Utils"
import * as S from "@effect-ts/schema"
import type { Annotation } from "@effect-ts/schema/_schema/annotation"
import { augmentRecord } from "@effect-ts/schema/_utils"
import * as Arbitrary from "@effect-ts/schema/Arbitrary"
import * as Encoder from "@effect-ts/schema/Encoder"
import * as Guard from "@effect-ts/schema/Guard"
import * as Parser from "@effect-ts/schema/Parser"
import * as Th from "@effect-ts/schema/These"
import type * as fc from "fast-check"

export class FromProperty<
  Self extends S.SchemaAny,
  Optional extends "optional" | "required",
  As extends O.Option<PropertyKey>,
  Def extends O.Option<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
> {
  constructor(
    readonly _as: As,
    readonly _schema: Self,
    readonly _optional: Optional,
    readonly _def: Def,
    readonly _map: HashMap.HashMap<Annotation<any>, any>
  ) {}

  schema<That extends S.SchemaAny>(
    schema: That
  ): FromProperty<That, Optional, As, O.None> {
    return new FromProperty(this._as, schema, this._optional, new O.None(), this._map)
  }

  opt(): FromProperty<Self, "optional", As, Def> {
    return new FromProperty(this._as, this._schema, "optional", this._def, this._map)
  }

  req(): FromProperty<Self, "required", As, Def> {
    return new FromProperty(this._as, this._schema, "required", this._def, this._map)
  }

  from<As1 extends PropertyKey>(
    as: As1
  ): FromProperty<Self, Optional, O.Some<As1>, Def> {
    return new FromProperty(
      new O.Some(as),
      this._schema,
      this._optional,
      this._def,
      this._map
    )
  }

  removeFrom(): FromProperty<Self, Optional, O.None, Def> {
    return new FromProperty(
      new O.None(),
      this._schema,
      this._optional,
      this._def,
      this._map
    )
  }

  def(
    _: Optional extends "required"
      ? () => S.ParsedShapeOf<Self>
      : ["default can be set only for required properties", never]
  ): FromProperty<Self, Optional, As, O.Some<["both", () => S.ParsedShapeOf<Self>]>>
  def<K extends "parser" | "constructor" | "both">(
    _: Optional extends "required"
      ? () => S.ParsedShapeOf<Self>
      : ["default can be set only for required properties", never],
    k: K
  ): FromProperty<Self, Optional, As, O.Some<[K, () => S.ParsedShapeOf<Self>]>>
  def(
    _: Optional extends "required"
      ? () => S.ParsedShapeOf<Self>
      : ["default can be set only for required properties", never],
    k?: "parser" | "constructor" | "both"
  ): FromProperty<
    Self,
    Optional,
    As,
    O.Some<["parser" | "constructor" | "both", () => S.ParsedShapeOf<Self>]>
  > {
    // @ts-expect-error
    return new FromProperty(
      this._as,
      this._schema,
      this._optional,
      // @ts-expect-error
      new O.Some([k ?? "both", _]),
      this._map
    )
  }

  removeDef(): FromProperty<Self, Optional, As, O.None> {
    return new FromProperty(
      this._as,
      this._schema,
      this._optional,
      new O.None(),
      this._map
    )
  }

  getAnnotation<A>(annotation: Annotation<A>): O.Option<A> {
    return HashMap.get_(this._map, annotation)
  }

  annotate<A>(
    annotation: Annotation<A>,
    value: A
  ): FromProperty<Self, Optional, As, Def> {
    return new FromProperty(
      this._as,
      this._schema,
      this._optional,
      this._def,
      HashMap.set_(this._map, annotation, value)
    )
  }
}

export function fromProp<Self extends S.SchemaAny>(
  schema: Self
): FromProperty<Self, "required", O.None, O.None> {
  return new FromProperty(
    new O.None(),
    schema,
    "required",
    new O.None(),
    HashMap.make()
  )
}

export type AnyFromProperty = FromProperty<any, any, any, any>

export type FromPropertyRecord = Record<PropertyKey, AnyFromProperty>

export type ShapeFromFromProperties<Props extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyFromProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in k]: S.ParsedShapeOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type ConstructorFromFromProperties<Props extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: k extends TagsFromFromProps<Props>
        ? never
        : Props[k] extends AnyFromProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : Props[k]["_def"] extends O.Some<["constructor" | "both", any]>
          ? {
              readonly [h in k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in k]: S.ParsedShapeOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type EncodedFromFromProperties<Props extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyFromProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.EncodedOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]: S.EncodedOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type HasRequiredFromProperty<Props extends FromPropertyRecord> =
  unknown extends {
    [k in keyof Props]: Props[k] extends AnyFromProperty
      ? Props[k]["_optional"] extends "required"
        ? unknown
        : never
      : never
  }[keyof Props]
    ? true
    : false

export type ParserErrorFromFromProperties<Props extends FromPropertyRecord> =
  S.CompositionE<
    | S.PrevE<S.LeafE<S.UnknownRecordE>>
    | S.NextE<
        HasRequiredFromProperty<Props> extends true
          ? S.CompositionE<
              | S.PrevE<
                  S.MissingKeysE<
                    {
                      [k in keyof Props]: Props[k] extends AnyFromProperty
                        ? Props[k]["_optional"] extends "optional"
                          ? never
                          : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
                          ? never
                          : Props[k]["_as"] extends O.Some<any>
                          ? Props[k]["_as"]["value"]
                          : k
                        : never
                    }[keyof Props]
                  >
                >
              | S.NextE<
                  S.StructE<
                    {
                      [k in keyof Props]: Props[k] extends AnyFromProperty
                        ? Props[k]["_optional"] extends "optional"
                          ? S.OptionalKeyE<
                              Props[k]["_as"] extends O.Some<any>
                                ? Props[k]["_as"]["value"]
                                : k,
                              S.ParserErrorOf<Props[k]["_schema"]>
                            >
                          : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
                          ? S.OptionalKeyE<
                              Props[k]["_as"] extends O.Some<any>
                                ? Props[k]["_as"]["value"]
                                : k,
                              S.ParserErrorOf<Props[k]["_schema"]>
                            >
                          : S.RequiredKeyE<
                              Props[k]["_as"] extends O.Some<any>
                                ? Props[k]["_as"]["value"]
                                : k,
                              S.ParserErrorOf<Props[k]["_schema"]>
                            >
                        : never
                    }[keyof Props]
                  >
                >
            >
          : S.StructE<
              {
                [k in keyof Props]: Props[k] extends AnyFromProperty
                  ? Props[k]["_optional"] extends "optional"
                    ? S.OptionalKeyE<
                        Props[k]["_as"] extends O.Some<any>
                          ? Props[k]["_as"]["value"]
                          : k,
                        S.ParserErrorOf<Props[k]["_schema"]>
                      >
                    : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
                    ? S.OptionalKeyE<
                        Props[k]["_as"] extends O.Some<any>
                          ? Props[k]["_as"]["value"]
                          : k,
                        S.ParserErrorOf<Props[k]["_schema"]>
                      >
                    : S.RequiredKeyE<
                        Props[k]["_as"] extends O.Some<any>
                          ? Props[k]["_as"]["value"]
                          : k,
                        S.ParserErrorOf<Props[k]["_schema"]>
                      >
                  : never
              }[keyof Props]
            >
      >
  >

export const fromPropertiesIdentifier =
  S.makeAnnotation<{ props: FromPropertyRecord }>()

export type SchemaFromProperties<Props extends FromPropertyRecord> = S.DefaultSchema<
  ParserInputFromFromProperties<Props>,
  ParserErrorFromFromProperties<Props>,
  ShapeFromFromProperties<Props>,
  ConstructorFromFromProperties<Props>,
  never,
  EncodedFromFromProperties<Props>,
  { props: Props }
>

export type TagsFromFromProps<Props extends FromPropertyRecord> = {
  [k in keyof Props]: Props[k]["_as"] extends O.None
    ? Props[k]["_optional"] extends "required"
      ? S.ApiOf<Props[k]["_schema"]> extends S.LiteralApi<infer KS>
        ? KS extends [string]
          ? k
          : never
        : never
      : never
    : never
}[keyof Props]

export function isFromPropertyRecord(u: unknown): u is FromPropertyRecord {
  return (
    typeof u === "object" &&
    u !== null &&
    Object.keys(u).every((k) => u[k] instanceof FromProperty)
  )
}

export function tagsFromFromProps<Props extends FromPropertyRecord>(
  props: Props
): Record<string, string> {
  const keys = Object.keys(props)
  const tags = {}
  for (const key of keys) {
    const s: S.SchemaAny = props[key]._schema

    if (
      O.isNone(props[key]._as) &&
      O.isNone(props[key]._def) &&
      props[key]._optional === "required" &&
      "literals" in s.Api &&
      Array.isArray(s.Api["literals"]) &&
      s.Api["literals"].length === 1 &&
      typeof s.Api["literals"][0] === "string"
    ) {
      tags[key] = s.Api["literals"][0]
    }
  }
  return tags
}

export function fromProps<Props extends FromPropertyRecord>(
  props: Props
): SchemaFromProperties<Props> {
  const parsers = {} as Record<string, Parser.Parser<unknown, unknown, unknown>>
  const encoders = {}
  const guards = {}
  const arbitrariesReq = {} as Record<string, Arbitrary.Gen<unknown>>
  const arbitrariesPar = {} as Record<string, Arbitrary.Gen<unknown>>
  const keys = Object.keys(props)
  const required = [] as string[]
  const defaults = [] as [string, [string, any]][]

  for (const key of keys) {
    parsers[key] = Parser.for(props[key]._schema)
    encoders[key] = Encoder.for(props[key]._schema)
    guards[key] = Guard.for(props[key]._schema)

    if (props[key]._optional === "required") {
      if (
        O.isNone(props[key]._def) ||
        (O.isSome(props[key]._def) && props[key]._def.value[0] === "constructor")
      ) {
        required.push(O.getOrElse_(props[key]._as, () => key))
      }
      if (
        O.isSome(props[key]._def) &&
        (props[key]._def.value[0] === "constructor" ||
          props[key]._def.value[0] === "both")
      ) {
        defaults.push([key, props[key]._def.value])
      }

      arbitrariesReq[key] = Arbitrary.for(props[key]._schema)
    } else {
      arbitrariesPar[key] = Arbitrary.for(props[key]._schema)
    }
  }

  const hasRequired = required.length > 0

  function guard(_: unknown): _ is ShapeFromFromProperties<Props> {
    if (typeof _ !== "object" || _ === null) {
      return false
    }

    for (const key of keys) {
      const s = props[key]

      if (s._optional === "required" && !(key in _)) {
        return false
      }
      if (key in _) {
        if (!guards[key](_[key])) {
          return false
        }
      }
    }
    return true
  }

  function parser(
    _: unknown
  ): Th.These<ParserErrorFromFromProperties<Props>, ShapeFromFromProperties<Props>> {
    if (typeof _ !== "object" || _ === null) {
      return Th.fail(
        S.compositionE(Chunk.single(S.prevE(S.leafE(S.unknownRecordE(_)))))
      )
    }
    let missingKeys = Chunk.empty()
    for (const k of required) {
      if (!(k in _)) {
        missingKeys = Chunk.append_(missingKeys, k)
      }
    }
    if (!Chunk.isEmpty(missingKeys)) {
      // @ts-expect-error
      return Th.fail(
        S.compositionE(
          Chunk.single(
            S.nextE(S.compositionE(Chunk.single(S.prevE(S.missingKeysE(missingKeys)))))
          )
        )
      )
    }

    let errors = Chunk.empty<
      S.OptionalKeyE<string, unknown> | S.RequiredKeyE<string, unknown>
    >()

    let isError = false

    const result = {}

    for (const key of keys) {
      const prop = props[key]
      const _as: string = O.getOrElse_(props[key]._as, () => key)

      if (_as in _) {
        const res = parsers[key](_[_as])

        if (res.effect._tag === "Left") {
          errors = Chunk.append_(
            errors,
            prop._optional === "required"
              ? S.requiredKeyE(_as, res.effect.left)
              : S.optionalKeyE(_as, res.effect.left)
          )
          isError = true
        } else {
          result[key] = res.effect.right.get(0)

          const warnings = res.effect.right.get(1)

          if (warnings._tag === "Some") {
            errors = Chunk.append_(
              errors,
              prop._optional === "required"
                ? S.requiredKeyE(_as, warnings.value)
                : S.optionalKeyE(_as, warnings.value)
            )
          }
        }
      } else {
        if (
          O.isSome(prop._def) &&
          // @ts-expect-error
          (prop._def.value[0] === "parser" || prop._def.value[0] === "both")
        ) {
          // @ts-expect-error
          result[key] = prop._def.value[1]()
        }
      }
    }

    if (!isError) {
      augmentRecord(result)
    }

    if (Chunk.isEmpty(errors)) {
      return Th.succeed(result as ShapeFromFromProperties<Props>)
    }

    const error_ = S.compositionE(Chunk.single(S.nextE(S.structE(errors))))
    const error = hasRequired ? S.compositionE(Chunk.single(S.nextE(error_))) : error_

    if (isError) {
      // @ts-expect-error
      return Th.fail(error)
    }

    // @ts-expect-error
    return Th.warn(result, error)
  }

  function encoder(
    _: ShapeFromFromProperties<Props>
  ): EncodedFromFromProperties<Props> {
    const enc = {}

    for (const key of keys) {
      if (key in _) {
        const _as: string = O.getOrElse_(props[key]._as, () => key)
        enc[_as] = encoders[key](_[key])
      }
    }
    // @ts-expect-error
    return enc
  }

  function arb(_: typeof fc): fc.Arbitrary<ShapeFromFromProperties<Props>> {
    const req = Dictionary.map_(arbitrariesReq, (g) => g(_))
    const par = Dictionary.map_(arbitrariesPar, (g) => g(_))

    // @ts-expect-error
    return _.record(req).chain((a) =>
      _.record(par, { withDeletedKeys: true }).map((b) => intersect(a, b))
    )
  }

  const tags = tagsFromFromProps(props)

  return pipe(
    S.identity(guard),
    S.parser(parser),
    S.encoder(encoder),
    S.arbitrary(arb),
    S.constructor((_) => {
      const res = {} as ShapeFromFromProperties<Props>
      Object.assign(res, _, tags)
      for (const [k, v] of defaults) {
        if (!(k in res)) {
          if (v[0] === "constructor" || v[0] === "both") {
            res[k] = v[1]()
          }
        }
      }
      return Th.succeed(res)
    }),
    S.mapApi(() => ({ props })),
    S.withDefaults,
    S.annotate(fromPropertiesIdentifier, { props })
  )
}

export function fromPropsPick<
  Props extends FromPropertyRecord,
  KS extends (keyof Props)[]
>(...ks: KS) {
  return (
    self: Props
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Props]: k extends KS[number] ? { [h in k]: Props[h] } : never
      }[keyof Props]
    >,
    "flat"
  > => {
    const newProps = {}
    for (const k of Object.keys(self)) {
      if (!ks.includes(k)) {
        newProps[k] = self[k]
      }
    }
    // @ts-expect-error
    return newProps
  }
}

export function fromPropsOmit<
  Props extends FromPropertyRecord,
  KS extends (keyof Props)[]
>(...ks: KS) {
  return (
    self: Props
  ): Compute<
    UnionToIntersection<
      {
        [k in keyof Props]: k extends KS[number] ? never : { [h in k]: Props[h] }
      }[keyof Props]
    >,
    "flat"
  > => {
    const newProps = {}
    for (const k of Object.keys(self)) {
      if (ks.includes(k)) {
        newProps[k] = self[k]
      }
    }
    // @ts-expect-error
    return newProps
  }
}

export type ParserInputFromFromProperties<Props extends FromPropertyRecord> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyFromProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
          ? {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: S.ParsedShapeOf<Props[k]["_schema"]>
            }
          : {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]: S.ParsedShapeOf<Props[k]["_schema"]>
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

type IsAnyOrUnknown<T> = any extends T ? never : T
type AorB<A, B> = IsAnyOrUnknown<A> extends never ? B : A

export type ParserInputFromParserInputOrEncodedFromProperties<
  Props extends FromPropertyRecord
> = Compute<
  UnionToIntersection<
    {
      [k in keyof Props]: Props[k] extends AnyFromProperty
        ? Props[k]["_optional"] extends "optional"
          ? {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: AorB<
                S.ParserInputOf<Props[k]["_schema"]>,
                S.EncodedOf<Props[k]["_schema"]>
              >
            }
          : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
          ? {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]?: AorB<
                S.ParserInputOf<Props[k]["_schema"]>,
                S.EncodedOf<Props[k]["_schema"]>
              >
            }
          : {
              readonly [h in Props[k]["_as"] extends O.Some<any>
                ? Props[k]["_as"]["value"]
                : k]: AorB<
                S.ParserInputOf<Props[k]["_schema"]>,
                S.EncodedOf<Props[k]["_schema"]>
              >
            }
        : never
    }[keyof Props]
  >,
  "flat"
>

export type ParserInputFromParserInputOrEncodedFromSchema<T> = T extends {
  Api: { props: infer Props }
}
  ? Props extends FromPropertyRecord
    ? ParserInputFromParserInputOrEncodedFromProperties<Props>
    : never
  : never

export type ParserInputFromEncodedFromProperties<Props extends FromPropertyRecord> =
  Compute<
    UnionToIntersection<
      {
        [k in keyof Props]: Props[k] extends AnyFromProperty
          ? Props[k]["_optional"] extends "optional"
            ? {
                readonly [h in Props[k]["_as"] extends O.Some<any>
                  ? Props[k]["_as"]["value"]
                  : k]?: S.EncodedOf<Props[k]["_schema"]>
              }
            : Props[k]["_def"] extends O.Some<["parser" | "both", any]>
            ? {
                readonly [h in Props[k]["_as"] extends O.Some<any>
                  ? Props[k]["_as"]["value"]
                  : k]?: S.EncodedOf<Props[k]["_schema"]>
              }
            : {
                readonly [h in Props[k]["_as"] extends O.Some<any>
                  ? Props[k]["_as"]["value"]
                  : k]: S.EncodedOf<Props[k]["_schema"]>
              }
          : never
      }[keyof Props]
    >,
    "flat"
  >

export type ParserInputFromEncodedFromSchema<T> = T extends {
  Api: { props: infer Props }
}
  ? Props extends FromPropertyRecord
    ? ParserInputFromEncodedFromProperties<Props>
    : never
  : never