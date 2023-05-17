import * as trpc from '@trpc/server'
import type {
  CreateRootConfigTypesFromPartial,
  PartialRootConfigTypes,
} from '@trpc/server/core/initTRPC'
import type {
  RootConfigTypes,
  RuntimeConfig,
} from '@trpc/server/core/internals/config'
import type { CreateProcedureReturnInput } from '@trpc/server/core/internals/procedureBuilder'
import type {
  ResolveOptions,
  DefaultValue as FallbackValue,
} from '@trpc/server/core/internals/utils'
import type { Parser } from '@trpc/server/core/parser'
import type {
  ProcedureBuilder,
  unsetMarker as _unsetMarker,
} from '@trpc/server/internals'

import type { Err } from '@daotl/web-common'
import { toTrpcError } from '@daotl/web-common/trpc'
import { runIfEffect } from '@daotl-effect/prelude'

// Fix: `trpc.unsetMarker` type became `any` in generated `effectify.d.ts`
declare module '@trpc/server' {
  const unsetMarker: typeof _unsetMarker
}

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

// To suppress TS error:
// error TS2742: The inferred type of 'effectify' cannot be named without a reference to '../node_modules/@trpc/server/dist/core/internals/config.js'. This is likely not portable. A type annotation is necessary.
// CreateRootConfigTypes,
export type _RootConfigTypes = RootConfigTypes

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
  'use' | 'input' | 'output' | 'query' | 'mutation' | 'subscription'
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

export type EffectProcedureBuilderBase_output<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase<R, TParams> & {
  /**
   * Add an output parser to the procedure.
   */
  output: EffectOutputFn<R, TParams>
}

export type EffectProcedureBuilderBase_output_input<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase_output<R, TParams> & {
  /**
   * Add an input parser to the procedure.
   */
  input: EffectInputFn<R, TParams>
}

export type EffectCreateProcedureReturnInput<
  TPrev extends trpc.ProcedureParams,
  TNext extends trpc.ProcedureParams,
  R = never,
> = CreateProcedureReturnInput<TPrev, TNext> extends ProcedureBuilder<
  infer TParams
>
  ? EffectProcedureBuilder<R, TParams>
  : never

export type EffectProcedureBuilder<
  R = never,
  TParams extends trpc.ProcedureParams = trpc.ProcedureParams,
> = EffectProcedureBuilderBase_output_input<R, TParams> & {
  /**
   * Add a middleware to the procedure.
   */
  use<$Params extends trpc.ProcedureParams>(
    fn:
      | trpc.MiddlewareBuilder<TParams, $Params>
      | trpc.MiddlewareFunction<TParams, $Params>,
  ): EffectCreateProcedureReturnInput<TParams, $Params, R>
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
