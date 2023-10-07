//https://github.com/sindresorhus/type-fest/blob/c43d48e45418dab47e69cd597710dcaad842e884/index.d.ts

/**
 * @tsplus global
 */
import type {
  // Basic
  // primitive: https://github.com/sindresorhus/type-fest/blob/5374588a88ee643893784f66367bc26b8e6509ec/source/primitive.d.ts
  Primitive,
  // typed-array: https://github.com/sindresorhus/type-fest/blob/5374588a88ee643893784f66367bc26b8e6509ec/source/typed-array.d.ts
  TypedArray,
  // basic: https://github.com/sindresorhus/type-fest/blob/5374588a88ee643893784f66367bc26b8e6509ec/source/basic.d.ts
  Class,
  Constructor,
  AbstractClass,
  AbstractConstructor,
  JsonObject,
  JsonArray,
  JsonPrimitive,
  JsonValue,
  // observable-like: https://github.com/sindresorhus/type-fest/blob/5374588a88ee643893784f66367bc26b8e6509ec/source/observable-like.d.ts
  Unsubscribable,
  Observer,
  ObservableLike,
  // Utilities
  // empty-object
  EmptyObject,
  IsEmptyObject,
  // non-empty-object
  NonEmptyObject,
  // unknown-record
  UnknownRecord,
  // except
  Except,
  // tagged-union
  TaggedUnion,
  // writable
  Writable,
  // writable-deep
  WritableDeep,
  // merge
  Merge,
  // merge-deep
  MergeDeep,
  MergeDeepOptions,
  // merge-exclusive
  MergeExclusive,
  // require-at-least-one
  RequireAtLeastOne,
  // require-exactly-one
  RequireExactlyOne,
  // require-all-or-none
  RequireAllOrNone,
  // require-one-or-none
  RequireOneOrNone,
  // omit-index-signature
  OmitIndexSignature,
  // pick-index-signature
  PickIndexSignature,
  // partial-deep
  PartialDeep,
  PartialDeepOptions,
  // required-deep
  RequiredDeep,
  // partial-on-undefined-deep
  PartialOnUndefinedDeep,
  PartialOnUndefinedDeepOptions,
  // readonly-deep
  ReadonlyDeep,
  // literal-union
  LiteralUnion,
  // promisable
  Promisable,
  // opaque
  Opaque,
  UnwrapOpaque,
  Tagged,
  UnwrapTagged,
  // invariant-of
  InvariantOf,
  // set-optional
  SetOptional,
  // set-readonly
  SetReadonly,
  // set-required
  SetRequired,
  // set-non-nullable
  SetNonNullable,
  // value-of
  ValueOf,
  // async-return-type
  AsyncReturnType,
  // conditional-except
  ConditionalExcept,
  // conditional-keys
  ConditionalKeys,
  // conditional-pick
  ConditionalPick,
  // conditional-pick-deep
  ConditionalPickDeep,
  ConditionalPickDeepOptions,
  // union-to-intersection
  UnionToIntersection,
  // stringified
  Stringified,
  // fixed-length-array
  FixedLengthArray,
  // multidimensional-array
  MultidimensionalArray,
  // multidimensional-readonly-array
  MultidimensionalReadonlyArray,
  // iterable-element
  IterableElement,
  // entry
  Entry,
  // entries
  Entries,
  // set-return-type
  SetReturnType,
  // asyncify
  Asyncify,
  // simplify
  Simplify,
  // jsonify
  Jsonify,
  // jsonifiable
  Jsonifiable,
  // schema
  // Renamed to avoid conflict with @effect/schema
  Schema as TFSchema,
  // literal-to-primitive
  LiteralToPrimitive,
  // literal-to-primitive-deep
  LiteralToPrimitiveDeep,
  // numeric
  PositiveInfinity,
  NegativeInfinity,
  Finite,
  Integer,
  Float,
  NegativeFloat,
  Negative,
  NonNegative,
  NegativeInteger,
  NonNegativeInteger,
  // string-key-of
  StringKeyOf,
  // exact
  Exact,
  // readonly-tuple
  ReadonlyTuple,
  // optional-keys-of
  OptionalKeysOf,
  // override-properties
  OverrideProperties,
  // has-optional-keys
  HasOptionalKeys,
  // required-keys-of
  RequiredKeysOf,
  // has-required-keys
  HasRequiredKeys,
  // readonly-keys-of
  ReadonlyKeysOf,
  // has-readonly-keys
  HasReadonlyKeys,
  // writable-keys-of
  WritableKeysOf,
  // has-writable-keys
  HasWritableKeys,
  // spread
  Spread,
  // tuple-to-union
  TupleToUnion,
  // is-equal
  IsEqual,
  // is-literal
  IsLiteral,
  IsStringLiteral,
  IsNumericLiteral,
  IsBooleanLiteral,
  IsSymbolLiteral,
  // is-any
  IsAny,
  // if-any
  IfAny,
  // is-never
  IsNever,
  // if-never
  IfNever,
  // is-unknown
  IsUnknown,
  // if-unknown
  IfUnknown,
  // Template literal types
  // camel-case
  CamelCase,
  // camel-cased-properties
  CamelCasedProperties,
  // camel-cased-properties-deep
  CamelCasedPropertiesDeep,
  // kebab-case
  KebabCase,
  // kebab-cased-properties
  KebabCasedProperties,
  // kebab-cased-properties-deep
  KebabCasedPropertiesDeep,
  // pascal-case
  PascalCase,
  // pascal-cased-properties
  PascalCasedProperties,
  // pascal-cased-properties-deep
  PascalCasedPropertiesDeep,
  // snake-case
  SnakeCase,
  // snake-cased-properties
  SnakeCasedProperties,
  // snake-cased-properties-deep
  SnakeCasedPropertiesDeep,
  // screaming-snake-case
  ScreamingSnakeCase,
  // delimiter-case
  DelimiterCase,
  // delimiter-cased-properties
  DelimiterCasedProperties,
  // delimiter-cased-properties-deep
  DelimiterCasedPropertiesDeep,
  // join
  Join,
  // split
  Split,
  // trim
  Trim,
  // replace
  Replace,
  // includes
  Includes,
  // get
  Get,
  // last-array-element
  LastArrayElement,
  // Miscellaneous
  // global-this
  GlobalThis,
  // package-json
  PackageJson,
  // tsconfig-json
  TsConfigJson,
} from 'type-fest'
