import { _A } from "@effect-ts/core/Utils"
import { pipe } from "@effect-ts-app/core/Function"
import { MongoClient as MongoClient_ } from "mongodb"

// TODO: we should probably share a single client...

const withClient = (url: string) =>
  Managed.make_(
    Effect.effectAsync<unknown, Error, MongoClient_>((res) => {
      const client = new MongoClient_(url)
      client.connect((err) => {
        err ? res(Effect.fail(err)) : res(Effect.succeed(client))
      })
    }),
    (cl) =>
      pipe(
        Effect.uninterruptible(
          Effect.effectAsync<unknown, Error, void>((res) => {
            cl.close((err, r) => res(err ? Effect.fail(err) : Effect.succeed(r)))
          })
        ),
        Effect.orDie
      )
  )

const makeMongoClient = (url: string, dbName?: string) =>
  pipe(
    withClient(url),
    Managed.map((x) => ({ db: x.db(dbName) }))
  )

export interface MongoClient extends _A<ReturnType<typeof makeMongoClient>> {}

export const MongoClient = Has.tag<MongoClient>()

export const { db } = Effect.deriveLifted(MongoClient)([], [], ["db"])

export const MongoClientLive = (mongoUrl: string, dbName?: string) =>
  Layer.fromManaged(MongoClient)(makeMongoClient(mongoUrl, dbName))
