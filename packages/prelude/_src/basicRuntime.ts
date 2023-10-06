// From: https://github.com/effect-ts-app/boilerplate/blob/b0aab9557730e9734abc69ae1f1c943f334689a4/_project/messages/_src/basicRuntime.ts

import { defaultTeardown } from '@effect-app/infra-adapters/runMain'
import * as ConfigProvider from 'effect/ConfigProvider'
import * as Effect from 'effect/Effect'
import * as Fiber from 'effect/Fiber'
import * as Logger from 'effect/Logger'
import * as LogLevel from 'effect/LogLevel'
import * as Scope from 'effect/Scope'
import { toConstantCase } from 'typed-case'
import type { Layer } from 'effect/Layer'
import { pipe, Exit, Runtime } from 'effect'

export const makeBasicRuntime = <R, E, A>(layer: Layer<R, E, A>) =>
  Effect.gen(function* ($) {
    const scope = yield* $(Scope.make())
    const env = yield* $(layer.buildWithScope(scope))
    const runtime = yield* $(
      pipe(Effect.runtime<A>(), Effect.scoped, Effect.provide(env)),
    )

    return {
      runtime,
      clean: scope.close(Exit.unit),
    }
  })

const provider = ConfigProvider.mapInputPath(
  ConfigProvider.fromEnv({
    pathDelim: '_', // i'd prefer "__"
    seqDelim: ',',
  }),
  toConstantCase,
)

export const basicRuntime = Runtime.defaultRuntime.runSync(
  makeBasicRuntime(
    Logger.minimumLogLevel(LogLevel.Debug) >
      Logger.logFmt >
      Effect.setConfigProvider(provider),
  ),
)

/**
 * @tsplus getter effect/io/Effect runSync$
 */
export const runSync = basicRuntime.runtime.runSync

/**
 * @tsplus getter effect/io/Effect runPromise$
 */
export const runPromise = basicRuntime.runtime.runPromise

/**
 * @tsplus getter effect/io/Effect runPromiseExit$
 */
export const runPromiseExit = basicRuntime.runtime.runPromiseExit

/**
 * @tsplus fluent effect/io/Effect runCallback$
 */
export const runCallback = basicRuntime.runtime.runCallback

/**
 * A dumbed down version of effect-ts/node's runtime, in preparation of new effect-ts
 * @tsplus fluent effect/io/Effect runMain$
 */
export function runMain<E, A>(eff: Effect.Effect<never, E, A>) {
  const onExit = (s: number) => {
    process.exit(s)
  }

  runCallback(
    Fiber.fromEffect(eff).map((context) => {
      runCallback(
        context.await().flatMap((exit) =>
          Effect.gen(function* ($) {
            if (exit.isFailure()) {
              if (exit.cause.isInterruptedOnly()) {
                yield* $(Effect.logWarning('Main process Interrupted'))
                defaultTeardown(0, context.id(), onExit)
                return
              } else {
                yield* $(
                  Effect.logError(exit.cause, 'Main process Error'),
                )
                defaultTeardown(1, context.id(), onExit)
                return
              }
            } else {
              defaultTeardown(0, context.id(), onExit)
            }
          }),
        ),
      )

      function handler() {
        process.removeListener('SIGTERM', handler)
        process.removeListener('SIGINT', handler)
        context.interruptAsFork(context.id()).runCallback()
      }
      process.once('SIGTERM', handler)
      process.once('SIGINT', handler)
    }),
  )
}
