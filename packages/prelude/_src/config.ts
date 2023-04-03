// From: https://github.com/effect-ts-app/boilerplate/blob/3a31f077b1dd748eb1d7c4cfcf6deb542bf61dfc/_project/message/_src/config.ts

export type ConfigA<Cfg> = Cfg extends Config.Variance<infer A> ? A : never

const serviceName = '@daotl-effect/prelude'

const envConfig = Config.string('env').withDefault('local-dev')

export const BaseConfig = Config.all({
  serviceName: Config(serviceName),
  env: envConfig,
  //  log: Config.string("LOG").
})

export type BaseConfig = ConfigA<typeof BaseConfig>
