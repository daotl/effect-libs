import * as trpc from '@trpc/server'
import type {
  ProcedureBuilder,
  unsetMarker as _unsetMarker,
} from '@trpc/server/internals'
import type {
  CreateRootConfigTypes,
  RootConfigTypes,
  RuntimeConfig,
} from '@trpc/server/core/internals/config'
import type {
  ResolveOptions,
  DefaultValue as FallbackValue,
  Overwrite,
} from '@trpc/server/core/internals/utils'
import type { Parser } from '@trpc/server/core/parser'

import type { Err } from '@daotl/web-common'
import { toTrpcError } from '@daotl/web-common/trpc'
import { runIfEffect } from '@daotl-effect/prelude'
// import type { EffectProcedureBuilder } from './index.js'

// Fix: `trpc.unsetMarker` type became `any` in generated `effectify.d.ts`
declare module '@trpc/server' {
  const unsetMarker: typeof _unsetMarker
}

// From: https://github.com/trpc/trpc/blob/37119d0a779815419913127c862a6e123287426c/packages/server/src/core/initTRPC.ts#L28-L38
type PartialRootConfigTypes = Partial<RootConfigTypes>
type CreateRootConfigTypesFromPartial<TTypes extends PartialRootConfigTypes> =
  CreateRootConfigTypes<{
    ctx: TTypes['ctx'] extends RootConfigTypes['ctx'] ? TTypes['ctx'] : object
    meta: TTypes['meta'] extends RootConfigTypes['meta']
      ? TTypes['meta']
      : object
    errorShape: TTypes['errorShape']
    transformer: trpc.DataTransformerOptions
  }>

export type EffectTRPC<
  TParams extends PartialRootConfigTypes = object,
  TOptions extends Partial<
    RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>
  > = Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>,
  R = never,
> = Except<trpc.TRPC<TParams, TOptions>, 'procedure'> & {
  procedure: trpc.TRPC<
    TParams,
    TOptions
  >['procedure'] extends trpc.ProcedureBuilder<infer TParams>
    ? EffectProcedureBuilder<R, TParams>
    : never
}

export function effectify<R = never>(r: Runtime<R>) {
  return <
    TParams extends PartialRootConfigTypes = object,
    TOptions extends Partial<
      RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>
    > = Partial<RuntimeConfig<CreateRootConfigTypesFromPartial<TParams>>>,
  >(
    t: trpc.TRPC<TParams, TOptions>,
  ): EffectTRPC<TParams, TOptions, R> => ({
    ...t,

    /**
     * Builder object for creating procedures
     */
    procedure: effectifyBuilder(r)(t.procedure),
  })
}

// Only for type inference
const _effectifyBuilderBase = <R = never>() =>
  undefined as unknown as <
    TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
  >(
    pb: trpc.ProcedureBuilder<TParams>,
  ) => EffectProcedureBuilderBase<R, TParams>

// Only for type inference
const _effectifyBuilderBase_output = <R = never>() =>
  undefined as unknown as <
    TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
  >(
    pb: trpc.ProcedureBuilder<TParams>,
  ) => EffectProcedureBuilderBase_output<R, TParams>

// To suppress TS error:
// The inferred type of '_effectifyInputFn' cannot be named without a reference to '../node_modules/@trpc/server/dist/core/parser.js'. This is likely not portable. A type annotation is necessary.ts(2742)
export type _Parser = Parser

// Only for type inference
const _effectifyInputFn = <
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
>(
  fn: ProcedureBuilder<TParams>['input'],
) => flow(fn, _effectifyBuilderBase_output<R>())

type EffectInputFn<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = ReturnType<typeof _effectifyInputFn<R, TParams>>

// Only for type inference
const _effectifyOutputFn = <
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
>(
  fn: ProcedureBuilder<TParams>['output'],
) => flow(fn, _effectifyBuilderBase<R>())

type EffectOutputFn<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = ReturnType<typeof _effectifyOutputFn<R, TParams>>

type EffectProcedureBuilderBase<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = Except<
  ProcedureBuilder<TParams>,
  'input' | 'output' | 'query' | 'mutation' | 'subscription' | 'use'
> & {
  /**
   * Add a middleware to the procedure.
   */
  use<$Params extends trpc.ProcedureParams>(
    fn:
      | trpc.MiddlewareBuilder<TParams, $Params>
      | trpc.MiddlewareFunction<TParams, $Params>,
  ): EffectCreateProcedureReturnInput<TParams, $Params>

  /**
   * Query procedure
   */
  query<$Output, E extends Err | trpc.TRPCError = never>(
    resolver: (
      opts: ResolveOptions<TParams>,
    ) => MaybeEffect<FallbackValue<TParams['_output_in'], $Output>, R, E>,
  ): trpc.BuildProcedure<'query', TParams, $Output>

  /**
   * Mutation procedure
   */
  mutation<$Output, E extends Err | trpc.TRPCError = never>(
    resolver: (
      opts: ResolveOptions<TParams>,
    ) => MaybeEffect<FallbackValue<TParams['_output_in'], $Output>, R, E>,
  ): trpc.BuildProcedure<'mutation', TParams, $Output>

  /**
   * Mutation procedure
   */
  subscription<$Output, E extends Err | trpc.TRPCError = never>(
    resolver: (
      opts: ResolveOptions<TParams>,
    ) => MaybeEffect<FallbackValue<TParams['_output_in'], $Output>, R, E>,
  ): trpc.BuildProcedure<'subscription', TParams, $Output>
}

export type EffectProcedureBuilderBase_output<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase<R, TParams> & {
  /**
   * Add an output parser to the procedure.
   */
  output: EffectOutputFn<R, TParams>
}

export type EffectProcedureBuilder<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase_output<R, TParams> & {
  /**
   * Add an input parser to the procedure.
   */
  input: EffectInputFn<R, TParams>
}
// trpc.CreateProcedureReturnInput<TParams, $Params> extends ProcedureBuilder<TParams> ? EffectProcedureParams<TParams> : never
export type EffectCreateProcedureReturnInput<
  TPrev extends trpc.ProcedureParams,
  TNext extends trpc.ProcedureParams,
> = EffectProcedureBuilder<{
  _config: TPrev['_config']
  _meta: TPrev['_meta']
  _ctx_out: Overwrite<TPrev['_ctx_out'], TNext['_ctx_out']>
  _input_in: FallbackValue<TNext['_input_in'], TPrev['_input_in']>
  _input_out: FallbackValue<TNext['_input_out'], TPrev['_input_out']>
  _output_in: FallbackValue<TNext['_output_in'], TPrev['_output_in']>
  _output_out: FallbackValue<TNext['_output_out'], TPrev['_output_out']>
}>

// type TPrev = {
//   _config: trpc.RootConfig<{
//     ctx: {}
//     meta: object
//     errorShape: trpc.DefaultErrorShape
//     transformer: any
//   }>
//   _ctx_out: {}
//   _input_in: typeof trpc.unsetMarker
//   _input_out: typeof trpc.unsetMarker
//   _output_in: typeof trpc.unsetMarker
//   _output_out: typeof trpc.unsetMarker
//   _meta: object
// }
// type TNext = {
//   _config: trpc.RootConfig<{
//     ctx: {}
//     meta: object
//     errorShape: trpc.DefaultErrorShape
//     transformer: any
//   }>
//   _ctx_out: {}
//   _input_in: unknown
//   _input_out: unknown
//   _output_in: unknown
//   _output_out: unknown
//   _meta: object
// }
// type Computed = {
//   _config: TPrev['_config']
//   _meta: TPrev['_meta']
//   _ctx_out: trpc.Overwrite<TPrev['_ctx_out'], TNext['_ctx_out']>
//   _input_in: FallbackValue<TNext['_input_in'], TPrev['_input_in']>
//   _input_out: FallbackValue<TNext['_input_out'], TPrev['_input_out']>
//   _output_in: FallbackValue<TNext['_output_in'], TPrev['_output_in']>
//   _output_out: FallbackValue<TNext['_output_out'], TPrev['_output_out']>
// }
// type Infer = EffectCreateProcedureReturnInput<
//   {
//     _config: trpc.RootConfig<{
//       ctx: {}
//       meta: object
//       errorShape: trpc.DefaultErrorShape
//       transformer: any
//     }>
//     _ctx_out: {}
//     _input_in: typeof trpc.unsetMarker
//     _input_out: typeof trpc.unsetMarker
//     _output_in: typeof trpc.unsetMarker
//     _output_out: typeof trpc.unsetMarker
//     _meta: object
//   },
//   {
//     _config: trpc.RootConfig<{
//       ctx: {}
//       meta: object
//       errorShape: trpc.DefaultErrorShape
//       transformer: any
//     }>
//     _ctx_out: {}
//     _input_in: unknown
//     _input_out: unknown
//     _output_in: unknown
//     _output_out: unknown
//     _meta: object
//   }
// >
/* extends EffectProcedureBuilder<{
_config: infer
_config
_meta: infer
_meta
_ctx_out: infer
_ctx_out
_input_in: infer
_input_in
_input_out: infer
_input_out
_output_in: infer
_output_in
_output_out: infer
_output_out
}>
  ?
{
  _config: _config
  _meta: _meta
  _ctx_out: _ctx_out
  _input_in: _input_in
  _input_out: _input_out
  _output_in: _output_in
  _output_out: _output_out
}
: never*/

export const effectifyBuilder =
  <R = never>(r: Runtime<R>) =>
  <TParams extends trpc.ProcedureParams>(
    pb: trpc.ProcedureBuilder<TParams>,
  ): EffectProcedureBuilder<R, TParams> => {
    const _runEffectResolver = runEffectResolver(r)
    const _effectifyBuilder = effectifyBuilder(r)
    return {
      ...pb,

      use: flow(pb.use, _effectifyBuilder) as unknown as EffectProcedureBuilder<
        R,
        TParams
      >['use'],

      input: flow(
        pb.input,
        _effectifyBuilder,
      ) as unknown as EffectProcedureBuilder<R, TParams>['input'],

      output: flow(
        pb.output,
        _effectifyBuilder,
      ) as unknown as EffectProcedureBuilder<R, TParams>['output'],

      query: flow(_runEffectResolver, pb.query),

      mutation: flow(_runEffectResolver, pb.mutation),

      subscription: flow(_runEffectResolver, pb.subscription),
    }
  }

export type EffectResolver<
  $Output,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
  R = never,
  E extends Err | trpc.TRPCError = never,
> = (
  opts: ResolveOptions<TParams>,
) => MaybeEffect<FallbackValue<TParams['_output_in'], $Output>, R, E>

const runEffectResolver =
  <R = never>(r: Runtime<R>) =>
  <
    $Output,
    TParams extends trpc.ProcedureParams,
    E extends Err | trpc.TRPCError = never,
  >(
    resolver: EffectResolver<$Output, TParams, R, E>,
  ) =>
    async function (
      opts: ResolveOptions<TParams>,
    ): Promise<FallbackValue<TParams['_output_in'], $Output>> {
      try {
        return await runIfEffect(r)(resolver(opts))
      } catch (err) {
        const _err = err instanceof trpc.TRPCError ? err : toTrpcError(err)
        throw _err
      }
    }
