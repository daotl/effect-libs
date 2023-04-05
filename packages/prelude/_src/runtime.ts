export type MaybeEffect<A, R = never, E = never> = A | Effect<R, E, A>

export const runIfEffect =
  <R = never>(r: Runtime<R>) =>
  <A, _R extends R, E = never>(x: MaybeEffect<A, _R, E>) =>
    Effect.isEffect(x) ? r.runPromise(x) : x
