import type { Effect } from '@effect-app/core/Effect'

import { toTrpcError } from '@daotl/web-common/trpc'

// Wrap Effect.gen and map error to TRPCError
export const effectGen = flow(Effect.gen, Effect.mapError(toTrpcError))
