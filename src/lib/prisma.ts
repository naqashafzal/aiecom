import { PrismaClient } from '@prisma/client'

const createPrismaDb = () => {
  return new PrismaClient()
}

declare global {
  var dbGlobal: undefined | ReturnType<typeof createPrismaDb>
}

export const db = globalThis.dbGlobal ?? createPrismaDb()

if (process.env.NODE_ENV !== 'production') globalThis.dbGlobal = db
