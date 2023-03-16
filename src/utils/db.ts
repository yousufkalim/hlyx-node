import { PrismaClient } from '@prisma/client'

let db: PrismaClient

declare global {
  // eslint-disable-next-line no-var, @typescript-eslint/naming-convention
  var __db: PrismaClient | undefined
}

if (!global.__db) {
  global.__db = new PrismaClient()
}
// eslint-disable-next-line prefer-const
db = global.__db

export { db }
