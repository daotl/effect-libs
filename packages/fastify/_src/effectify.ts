import type * as Fa from 'fastify'
import type { ResolveFastifyReplyType } from 'fastify/types/type-provider.js'

import type { Method } from './types.js'

export class NodeServerCloseError {
  readonly _tag = 'NodeServerCloseError'
  constructor(readonly _error: Error) {}
}

export class NodeServerListenError {
  readonly _tag = 'NodeServerListenError'
  constructor(readonly _error: Error) {}
}

type ExitHandler = (
  req: Fa.FastifyRequest,
  reply: Fa.FastifyReply,
) => (cause: Cause<never>) => Effect<void, never, never>

export const stagFastifyAppConfig = '@effect-app/fastify/AppConfig' as const

export interface FastifyAppConfig {
  readonly _tag: typeof stagFastifyAppConfig
  readonly host: string
  readonly port: number
  readonly exitHandler: ExitHandler
}

export const tagFastifyAppConfig = Tag('FastifyAppConfig')<
  FastifyAppConfig,
  FastifyAppConfig
>()

export const createLiveFastifyAppConfig = (
  host: string,
  port: number,
  exitHandler: ExitHandler = defaultExitHandler,
) =>
  Layer.succeed(
    tagFastifyAppConfig,
    tagFastifyAppConfig.of({
      _tag: stagFastifyAppConfig,
      host,
      port,
      exitHandler:
        (req: Fa.FastifyRequest, reply: Fa.FastifyReply) =>
        (cause: Cause<never>) =>
          exitHandler(req, reply)(cause),
    }),
  )

export const stagFastifyAppTag = '@effect-app/fastify/App' as const

export const defaultExitHandler: ExitHandler =
  (_req: Fa.FastifyRequest, res: Fa.FastifyReply) => (cause) =>
    Effect.sync(() => {
      if (cause.isDie()) {
        console.error(cause.pretty)
      }
      res.statusCode = 500
    })

/**
 * FastifyPluginCallback
 *
 * Fastify allows the user to extend its functionalities with plugins. A plugin can be a set of routes, a server decorator or whatever. To activate plugins, use the `fastify.register()` method.
 */
export type FastifyPluginCallback<
  FastifyInstance,
  Options extends Fa.FastifyPluginOptions = Record<never, never>,
> = (
  instance: FastifyInstance,
  opts: Options,
  done: (err?: Error) => void,
) => void

/**
 * FastifyPluginAsync
 *
 * Fastify allows the user to extend its functionalities with plugins. A plugin can be a set of routes, a server decorator or whatever. To activate plugins, use the `fastify.register()` method.
 */
export type FastifyPluginAsync<
  FastifyInstance,
  Options extends Fa.FastifyPluginOptions = Record<never, never>,
> = (instance: FastifyInstance, opts: Options) => Promise<void>

export type FastifyRegisterOptions<FastifyInstance, Options> =
  | (Fa.RegisterOptions & Options)
  | ((instance: FastifyInstance) => Fa.RegisterOptions & Options)

type RegisterPluginPartialFn<
  FastifyInstance,
  FastifyApp,
  R = never,
  Options extends Fa.FastifyPluginOptions = Record<never, never>,
> = (
  opts?: FastifyRegisterOptions<FastifyInstance, Options>,
) => Effect<void, never, FastifyApp | R>

/**
 * FastifyRegister
 *
 * Function for adding a plugin to fastify. The options are inferred from the passed in FastifyPlugin parameter.
 */
// For native plugins
export interface EffectFastifyRegister<FastifyInstance, FastifyApp> {
  <Options extends Fa.FastifyPluginOptions>(
    plugin: FastifyPluginCallback<FastifyInstance, Options>,
  ): RegisterPluginPartialFn<FastifyInstance, FastifyApp, never, Options>

  <Options extends Fa.FastifyPluginOptions>(
    plugin: FastifyPluginAsync<FastifyInstance, Options>,
  ): RegisterPluginPartialFn<FastifyInstance, FastifyApp, never, Options>

  <Options extends Fa.FastifyPluginOptions>(
    plugin:
      | FastifyPluginCallback<FastifyInstance, Options>
      | FastifyPluginAsync<FastifyInstance, Options>
      | Promise<{
          default: FastifyPluginCallback<FastifyInstance, Options>
        }>
      | Promise<{
          default: FastifyPluginAsync<FastifyInstance, Options>
        }>,
  ): RegisterPluginPartialFn<FastifyInstance, FastifyApp, never, Options>
}

export interface EffectRouteShorthandMethod<
  RouteShorthandOptions,
  EffectRouteHandlerMethod,
  EffectRouteShorthandOptionsWithHandler,
  R = never,
> {
  (
    path: string,
    opts: RouteShorthandOptions,
    handler: EffectRouteHandlerMethod,
  ): Effect<void, never, R>
  // biome-ignore format: compact
  (path: string, handler: EffectRouteHandlerMethod): Effect<void, never, R>
  // biome-ignore format: compact
  (path: string, opts: EffectRouteShorthandOptionsWithHandler): Effect<void, never, R>
}

const _type = <T>(): T => undefined as T

export function effectify<
  BaseContextConfig = Fa.ContextConfigDefault,
  TypeProvider extends Fa.FastifyTypeProvider = Fa.FastifyTypeProviderDefault,
  BaseSchemaCompiler extends Fa.FastifySchema = Fa.FastifySchema,
  Logger extends Fa.FastifyBaseLogger = Fa.FastifyBaseLogger,
  RawServer extends Fa.RawServerBase = Fa.RawServerDefault,
  RawRequest extends Fa.RawRequestDefaultExpression<RawServer> = Fa.RawRequestDefaultExpression<RawServer>,
  RawReply extends Fa.RawReplyDefaultExpression<RawServer> = Fa.RawReplyDefaultExpression<RawServer>,
  BaseRouteGeneric extends Fa.RouteGenericInterface = Fa.RouteGenericInterface,
>(
  fastify: Fa.FastifyInstance<
    RawServer,
    RawRequest,
    RawReply,
    Logger,
    TypeProvider
  >,
  // Used to pass liveFastifyAppConfig to effectified Fastify sub instances which will be passed to plugins
  liveFastifyAppConfig?: Layer<FastifyAppConfig, never, never>,
) {
  type FastifyInstance = typeof fastify

  let _liveFastifyAppConfig = liveFastifyAppConfig

  const _effectify = <
    // biome-ignore format: compact
    FastifyInstance extends Fa.FastifyInstance<RawServer, RawRequest, RawReply, Logger, TypeProvider>,
  >(
    fastify: FastifyInstance,
    liveFastifyAppConfig?: Layer<FastifyAppConfig, never, never>,
  ) =>
    // biome-ignore format: compact
    effectify<BaseContextConfig, TypeProvider, BaseSchemaCompiler, Logger, RawServer, RawRequest, RawReply, BaseRouteGeneric>(fastify, liveFastifyAppConfig)

  // type Fastify = ReturnType<typeof _effectify<FastifyInstance>>

  // biome-ignore format: compact
  type FastifyRequest<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.FastifyRequest<RouteGeneric, RawServer, RawRequest, SchemaCompiler, TypeProvider, ContextConfig, Logger>

  // biome-ignore format: compact
  type FastifyReply<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.FastifyReply<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, SchemaCompiler, TypeProvider>

  // biome-ignore format: compact
  type RouteHandlerMethod<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.RouteHandlerMethod<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, SchemaCompiler, TypeProvider, Logger>

  type EffectRouteHandlerMethod<
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = (
    this: FastifyInstance,
    req: FastifyRequest<RouteGeneric, ContextConfig, SchemaCompiler>,
    reply: FastifyReply<RouteGeneric, ContextConfig, SchemaCompiler>,
  ) => Effect<
    ResolveFastifyReplyType<
      TypeProvider,
      SchemaCompiler,
      RouteGeneric
    > extends infer Return
      ? Return | void
      : unknown,
    never,
    R
  >

  // biome-ignore format: compact
  type RouteOptions<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.RouteOptions<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, SchemaCompiler, TypeProvider/*, Logger*/>

  type EffectRouteOptions<
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Except<
    RouteOptions<RouteGeneric, ContextConfig, SchemaCompiler>,
    'handler'
  > & {
    // biome-ignore format: compact
    handler: EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>
  }

  // biome-ignore format: compact
  type RouteShorthandOptions<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.RouteShorthandOptions<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, SchemaCompiler, TypeProvider, Logger>

  // biome-ignore format: compact
  type RouteShorthandOptionsWithHandler<
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Fa.RouteShorthandOptionsWithHandler<RawServer, RawRequest, RawReply, RouteGeneric, ContextConfig, SchemaCompiler, TypeProvider, Logger>

  type EffectRouteShorthandOptionsWithHandler<
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = Except<RouteShorthandOptionsWithHandler, 'handler'> & {
    // biome-ignore format: compact
    handler: EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>
  }

  const tFastifyApp = Effect.gen(function* ($) {
    // if scope closes, set open to false
    const open = yield* $(
      Ref.make(true).acquireRelease((a) => Effect.succeed(a.set(false))),
    )

    const { exitHandler } = yield* $(tagFastifyAppConfig)

    // if scope opens, create server, on scope close, close connections and server.
    yield* $(
      Effect.async<FastifyInstance, never, never>((cb) => {
        fastify.addHook('onError', (_req, _reply, err, done) => {
          done()
          cb(Effect.die(new NodeServerListenError(err)))
        })
        cb(Effect.succeed(fastify))
      }).acquireRelease(
        (_fastify) => Effect.unit,
        // Scopes are also closed when plugin registrations are done for effectified Fastify sub instances, so don't close the server here for now.
        // Effect.async<never, never, void>((cb) => {
        //   void fastify.close().then((err) => {
        //     if (err) {
        //       cb(Effect.die(new NodeServerCloseError(err)))
        //     } else {
        //       cb(Effect.unit)
        //     }
        //   })
        // }),
      ),
    )

    const supervisor = yield* $(
      Supervisor.track.acquireRelease((s) =>
        s.value.flatMap((_) => _.interruptAll),
      ),
    )

    const runtime = <
      R = never,
      RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
      ContextConfig extends BaseContextConfig = BaseContextConfig,
      SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
    >(
      // biome-ignore format: compact
      handler: EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>,
    ) =>
      Effect.runtime<R>().map(
        (r): RouteHandlerMethod<RouteGeneric, ContextConfig, SchemaCompiler> =>
          (req, reply) =>
            // TODO: restore trace from "handler"
            r.runPromise(
              open.get.flatMap((open) =>
                (open ? handler.call(fastify, req, reply) : Effect.interrupt)
                  .onError(
                    exitHandler(
                      req as Fa.FastifyRequest,
                      reply as Fa.FastifyReply,
                    ),
                  )
                  .supervised(supervisor),
              ),
            ) as ResolveFastifyReplyType<
              TypeProvider,
              SchemaCompiler,
              RouteGeneric
            > extends infer Return
              ? Promise<Return | void>
              : unknown,
      )

    // function middieRuntime<
    //   Handler extends EffectMiddieHandler<any>,
    // >(handler: Handler) {
    //   type Env = _R<
    //     Handler extends EffectMiddieHandler<infer R>
    //       ? Effect<void, never, R>
    //       : never
    //   >
    //   return Effect.runtime<Env>().map(
    //     (r): Middie.Handler =>
    //       (req, res, next) => {
    //         r.runCallback(
    //           open.get
    //             .flatMap((open) =>
    //               open ? handler(req, res, next) : Effect.interrupt(),
    //             )
    //             .onError(exitHandler(req, res))
    //             .supervised(supervisor),
    //         )
    //       },
    //   )
    // }

    // function middieSimpleRuntime<
    //   Handler extends EffectMiddieSimpleHandler<any>
    // >(handler: Handler) {
    //   type Env = _R<
    //     Handler extends EffectMiddieSimpleHandler<infer R> ? Effect<void, never, R>
    //       : never
    //   >
    //   return Effect.runtime<Env>().map((r): Middie.SimpleHandleFunction => (req, res) => {
    //     r.runCallback(
    //       open.get
    //         .flatMap(open => open ? handler(req, res) : Effect.interrupt())
    //         .onError(exitHandler(req, res))
    //         .supervised(supervisor)
    //     )
    //   })
    // }

    // function middieNextRuntime<
    //   Handler extends EffectMiddieNextHandler<any>
    // >(handler: Handler) {
    //   type Env = _R<
    //     Handler extends EffectMiddieNextHandler<infer R> ? Effect<void, never, R>
    //       : never
    //   >
    //   return Effect.runtime<Env>().map((r): Middie.NextHandleFunction => (req, res, next) => {
    //     r.runCallback(
    //       open.get
    //         .flatMap(open => open ? handler(req, res, next) : Effect.interrupt())
    //         .onError(exitHandler(req, res))
    //         .supervised(supervisor)
    //     )
    //   })
    // }

    return {
      _tag: stagFastifyAppTag,
      fastify,
      supervisor,
      runtime: runtime,
      // middieRuntime,
      // middieSimpleRuntime,
      // middieNextRuntime
    }
  })

  type FastifyApp = Effect.Success<typeof tFastifyApp>
  type FastifyCtx = FastifyAppConfig | FastifyApp

  const tagFastifyApp = Tag('FastifyApp')<FastifyApp, FastifyApp>()

  const liveFastifyApp: Layer<FastifyApp, never, FastifyAppConfig> =
    tFastifyApp.toLayerScoped(tagFastifyApp)

  function createLiveFastify<R = never>(
    host: string,
    port: number,
    exitHandler: ExitHandler = defaultExitHandler,
  ): Layer<FastifyCtx, never, R> {
    _liveFastifyAppConfig ??= createLiveFastifyAppConfig(
      host,
      port,
      exitHandler,
    )
    return liveFastifyApp.provideMerge(_liveFastifyAppConfig)
  }

  const accessFastify = tagFastifyApp.map((_) => _.fastify)

  const listen = Effect.zip(tagFastifyAppConfig, accessFastify, {
    concurrent: true,
  }).flatMap(([{ host, port }, fastify]) =>
    Effect.async<FastifyInstance, never, never>((cb) => {
      fastify.listen({ host, port }, (err, _address) => {
        if (err) {
          cb(Effect.die(new NodeServerListenError(err)))
        } else {
          cb(Effect.succeed(fastify))
        }
      })
    }),
  )

  type _EffectFastifyRegister = EffectFastifyRegister<
    FastifyInstance,
    FastifyApp
  >

  const registerNative: _EffectFastifyRegister = (<
      Options extends Fa.FastifyPluginOptions,
    >(
      plugin:
        | FastifyPluginCallback<FastifyInstance, Options>
        | FastifyPluginAsync<FastifyInstance, Options>
        | Promise<{
            default: FastifyPluginCallback<FastifyInstance, Options>
          }>
        | Promise<{
            default: FastifyPluginAsync<FastifyInstance, Options>
          }>,
    ) =>
    (opts?: FastifyRegisterOptions<FastifyInstance, Options>) =>
      accessFastify.flatMap((fastify) =>
        Effect.promise(async () => {
          await fastify.register(
            // biome-ignore format: compact
            plugin as unknown as (Fa.FastifyPluginCallback<Options, RawServer, TypeProvider, Logger> | Fa.FastifyPluginAsync<Options, RawServer, TypeProvider, Logger> | Promise<{ default: Fa.FastifyPluginCallback<Options, RawServer, TypeProvider, Logger> }> | Promise<{ default: Fa.FastifyPluginAsync<Options, RawServer, TypeProvider, Logger> }>),
            opts as Fa.FastifyRegisterOptions<Options>,
          )
        }),
      )) as _EffectFastifyRegister

  type EffectFastifyPlugin<
    // Using the non-exported type `Fastify` will become `any`, must be passed with generic
    Fastify,
    R = never,
    Options extends Fa.FastifyPluginOptions = Record<never, never>,
  > = (fa: Fastify, opts: Options) => Effect<void, never, FastifyApp | R>

  function register<
    // Using the non-exported type `Fastify` will become `any`, must be passed with generic
    Fastify,
    R = never,
    Options extends Fa.FastifyPluginOptions = Record<never, never>,
  >(this: Fastify, plugin: EffectFastifyPlugin<Fastify, R, Options>) {
    return (
      opts?: FastifyRegisterOptions<FastifyInstance, Options>,
    ): Effect<void, never, FastifyApp | R> =>
      accessFastify.flatMap((fastify) =>
        // @ts-expect-error TBD why: Need async-await here or the whole program will exit with code 13
        Effect.async<void, never, FastifyApp>(async (cb) => {
          await fastify.register((instance, _opts, done) => {
            const fa = _effectify(
              instance as unknown as FastifyInstance,
              _liveFastifyAppConfig,
            )

            const tPlugin = plugin(fa as unknown as Fastify, _opts)
              // TODO: This is a bit hacky way to just provide the child FastifyApp
              .provideServiceEffect(fa.tagFastifyApp, fa.tFastifyApp)
              .scoped.tap(() => {
                done()
                return Effect.unit
              }) as unknown as Effect<void, never, FastifyApp>

            cb(tPlugin)
          }, opts as Fa.FastifyRegisterOptions<Options>)
        }),
      )
  }

  const runFasitfyHandler = <
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  >(
    // biome-ignore format: compact
    handler: EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>,
  ) => tagFastifyApp.flatMap((_) => _.runtime(handler))

  const route = <
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  >(
    opts: EffectRouteOptions<R, RouteGeneric, ContextConfig, SchemaCompiler>,
  ) =>
    runFasitfyHandler(opts.handler).flatMap((handler) =>
      accessFastify.tap((fastify) =>
        fastify.route({ ...opts, handler } as RouteOptions<
          RouteGeneric,
          ContextConfig,
          SchemaCompiler
        >),
      ),
    )

  type _EffectRouteShorthandMethod<
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  > = EffectRouteShorthandMethod<
    RouteShorthandOptions<RouteGeneric, ContextConfig, SchemaCompiler>,
    EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>,
    // biome-ignore format: compact
    EffectRouteShorthandOptionsWithHandler<R, RouteGeneric, ContextConfig, SchemaCompiler>,
    FastifyApp | R
  >

  function isEffectRouteHandlerMethod<
    R = never,
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  >(
    _: unknown,
  ): // biome-ignore format: compact
  _ is EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler> {
    return _ instanceof Function
  }

  const routeMethod =
    <
      R = never,
      RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
      ContextConfig extends BaseContextConfig = BaseContextConfig,
      SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
    >(
      method: Method,
    ): // biome-ignore format: compact
    _EffectRouteShorthandMethod<R, RouteGeneric, ContextConfig, SchemaCompiler> =>
    (path: string, ...args: unknown[]) => {
      // biome-ignore format: compact
      const [handler, opts] = isEffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>(args[0])
        ? [args[0], undefined]
        : isEffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>(args[1])
        ? [
            args[1],
            // biome-ignore format: compact
            args[0] as RouteShorthandOptions<RouteGeneric, ContextConfig, SchemaCompiler>,
          ]
        : [
            (
              // biome-ignore format: compact
              args[0] as EffectRouteShorthandOptionsWithHandler<R, RouteGeneric, ContextConfig, SchemaCompiler>
            ).handler,
            undefined,
          ]

      return runFasitfyHandler(handler).flatMap((handler) =>
        accessFastify.tap((fastify) => {
          return opts
            ? fastify[method](path, opts, handler)
            : fastify[method](path, handler)
        }),
      )
    }

  const onRequestHookHandler = <
    RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
    ContextConfig extends BaseContextConfig = BaseContextConfig,
    SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
  >() =>
    _type<
      Fa.onRequestHookHandler<
        RawServer,
        RawRequest,
        RawReply,
        RouteGeneric,
        ContextConfig,
        SchemaCompiler,
        TypeProvider,
        Logger
      >
    >()

  return {
    tFastifyApp,
    tagFastifyApp,
    liveFastifyApp,
    createLiveFastify,
    accessFastify,
    listen,
    registerNative,
    register,
    route,
    routeMethod,
    all: routeMethod('all'),
    get: routeMethod('get'),
    post: routeMethod('post'),
    put: routeMethod('put'),
    delete: routeMethod('delete'),
    patch: routeMethod('patch'),
    options: routeMethod('options'),
    head: routeMethod('head'),

    // Only for exporting types, don't use the values
    _types: {
      // This will cause: Type alias 'Fastify' circularly references itself.
      // Fastify: _type<Fastify>(),

      BaseContextConfig: _type<BaseContextConfig>(),
      TypeProvider: _type<TypeProvider>(),
      BaseSchemaCompiler: _type<BaseSchemaCompiler>(),
      RawServer: _type<RawServer>(),
      RawRequest: _type<RawRequest>(),
      RawReply: _type<RawReply>(),
      Logger: _type<Logger>(),
      BaseRouteGeneric: _type<BaseRouteGeneric>(),

      FastifyRequest: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<FastifyRequest<RouteGeneric, ContextConfig, SchemaCompiler>>(),

      FastifyReply: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() => _type<FastifyReply<RouteGeneric, ContextConfig, SchemaCompiler>>(),

      RouteHandlerMethod: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<
          RouteHandlerMethod<RouteGeneric, ContextConfig, SchemaCompiler>
        >(),

      // biome-ignore format: compact
      EffectRouteHandlerMethod: <
        R = never,
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() => _type<EffectRouteHandlerMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>>(),

      RouteOptions: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() => _type<RouteOptions<RouteGeneric, ContextConfig, SchemaCompiler>>(),

      EffectRouteOptions: <
        R = never,
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<
          EffectRouteOptions<R, RouteGeneric, ContextConfig, SchemaCompiler>
        >(),

      RouteShorthandOptions: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<
          RouteShorthandOptions<RouteGeneric, ContextConfig, SchemaCompiler>
        >(),

      // biome-ignore format: compact
      RouteShorthandOptionsWithHandler: <
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() => _type<RouteShorthandOptionsWithHandler<RouteGeneric, ContextConfig, SchemaCompiler>>(),

      // biome-ignore format: compact
      EffectRouteShorthandOptionsWithHandler: <
        R = never,
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<EffectRouteShorthandOptionsWithHandler<R, RouteGeneric, ContextConfig, SchemaCompiler>>(),

      FastifyApp: _type<FastifyApp>(),
      FastifyCtx: _type<FastifyCtx>(),
      EffectFastifyRegister: _type<_EffectFastifyRegister>(),
      EffectFastifyPlugin: <
        R = never,
        Options extends Fa.FastifyPluginOptions = Record<never, never>,
      >() => _type<EffectFastifyPlugin<R, Options>>(),

      // biome-ignore format: compact
      EffectRouteShorthandMethod: <
        R = never,
        RouteGeneric extends BaseRouteGeneric = BaseRouteGeneric,
        ContextConfig extends BaseContextConfig = BaseContextConfig,
        SchemaCompiler extends BaseSchemaCompiler = BaseSchemaCompiler,
      >() =>
        _type<_EffectRouteShorthandMethod<R, RouteGeneric, ContextConfig, SchemaCompiler>>(),

      onRequestHookHandler: onRequestHookHandler,

      OnRequestHookHandler: onRequestHookHandler<
        BaseRouteGeneric,
        BaseContextConfig,
        BaseSchemaCompiler
      >(),
    },
  }
}
