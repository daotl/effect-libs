import '@effect-app/prelude/_global'

import './_global.ext.js'

/**
 * @tsplus global
 */
// Override `Schema` from `@effect-app/prelude/_global`
import { Schema } from '@daotl-effect/prelude/_global/schema'

/**
 * @tsplus global
 */
import { Match } from '@daotl-effect/prelude/_global/match'

/**
 * @tsplus global
 */
import { none, some } from 'effect/Option'

import './_global/type-fest.js'

/**
 * @tsplus global
 */
import { R } from '@daotl-effect/prelude/_global/remeda'

/**
 * @tsplus global
 */
import type { MaybeEffect } from '@daotl-effect/prelude/runtime'
