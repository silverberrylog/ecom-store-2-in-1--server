import { PrismaClient } from '@prisma/client'
import { expect } from 'chai'
import { loadAll } from './utils/loaders.js'

const start = async () => {
    const url = await loadAll().listen({ port: 4000, host: '0.0.0.0' })
    console.log(`Listening on ${url}`)
}
start()
