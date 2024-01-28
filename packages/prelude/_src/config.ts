// From: https://github.com/effect-ts-app/boilerplate/blob/a848ec40542630fe4b62ead67596eb6c396a25a3/_project/messages/_src/config.ts

const serviceName = '@daotl-effect/prelude'

const envConfig = Config.string('env').withDefault('local-dev')

export const BaseConfig = Config.all({
  serviceName: Config.succeed(serviceName),
  env: envConfig,
  //  log: Config.string("LOG").
})
export type ConfigA<Cfg> = Cfg extends Config<infer A> ? A : never
export type BaseConfig = ConfigA<typeof BaseConfig>
