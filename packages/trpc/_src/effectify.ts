import * as trpc from '@trpc/server'
import type { ProcedureBuilder } from '@trpc/server/internals'
import type {
  CreateRootConfigTypes,
  RootConfigTypes,
  RuntimeConfig,
} from '@trpc/server/core/internals/config'
import type {
  ResolveOptions,
  DefaultValue as FallbackValue,
} from '@trpc/server/core/internals/utils'
import type { Parser } from '@trpc/server/core/parser'

import type { Err } from '@daotl/web-common'
import { toTrpcError } from '@daotl/web-common/trpc'
import { runIfEffect } from '@daotl-effect/prelude'

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
  procedure: trpc.TRPC<TParams, TOptions>['procedure'] extends ProcedureBuilder<
    infer TParams
  >
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

// To suppress TS error:
// The inferred type of '_effectifyInputFn' cannot be named without a reference to '../node_modules/@trpc/server/dist/core/parser.js'. This is likely not portable. A type annotation is necessary.ts(2742)
export type _Parser = Parser

// Only for type inference
const _effectifyInputFn = <
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
>(
  fn: ProcedureBuilder<TParams>['input'],
) => flow(fn, _effectifyBuilderBase<R>())

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
  'input' | 'query' | 'mutation' | 'subscription'
> & {
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

export type EffectProcedureBuilder<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase<R, TParams> & {
  /**
   * Add an input parser to the procedure.
   */
  input: EffectInputFn<R, TParams>

  /**
   * Add an output parser to the procedure.
   */
  output: EffectOutputFn<R, TParams>
}

export const effectifyBuilder =
  <R = never>(r: Runtime<R>) =>
  <TParams extends trpc.ProcedureParams>(
    pb: trpc.ProcedureBuilder<TParams>,
  ): EffectProcedureBuilder<R, TParams> => {
    const _runEffectResolver = runEffectResolver(r)
    const _effectifyBuilder = effectifyBuilder(r)
    return {
      ...pb,

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
