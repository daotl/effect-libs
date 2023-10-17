export * from './runtime.js'
export { basicRuntime } from './basicRuntime.js'

const arr = [2, 3, 4, 2, 3, 5]
console.log(arr.randomElement())
console.log(arr.randomElement())
console.log(arr.randomElement())

import { NonEmptyArray } from 'effect/ReadonlyArray'

const nera = ReadonlyArray.make(1, 2, 3)

const goodType = arr.toNonEmptyArray
const badType = [].toNonEmptyArray
