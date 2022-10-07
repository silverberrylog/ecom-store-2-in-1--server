import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'
import Fastify from 'fastify'
import { productsController } from '../components/products/controller.js'
import { usersController } from '../components/users/controller.js'
import { AppError } from './AppError.js'

export const loadEnvVariables = () => {
    config()
    console.log('Env variables were loaded')
}

export const loadServer = () => {
    const fastify = Fastify({
        ajv: {
            customOptions: {
                strictSchema: true,
                coerceTypes: false,
                keywords: [
                    {
                        keyword: 'decimals',
                        type: 'number',
                        metaSchema: {
                            type: 'integer',
                        },
                        compile: maxDecimals => data => {
                            const dataStr = data.toString()

                            return dataStr.indexOf('.') != -1
                                ? dataStr.split('.')[1].length <= maxDecimals
                                : true
                        },
                    },
                ],
            },
        },
        ignoreTrailingSlash: true,
    })

    /**
     * @type {import('@fastify/swagger').FastifySwaggerOptions}
     */
    const swaggerConfig = {
        routePrefix: '/docs',
        exposeRoute: true,
        swagger: {
            info: {
                title: 'Documentation',
                description: 'Documentation for the admin API',
            },
        },
        host: 'localhost',
        consumes: ['application/json'],
        produces: ['application/json'],
        uiConfig: {
            docExpansion: 'full',
        },
        exposeRoute: true,
    }
    fastify.register(import('@fastify/swagger'), swaggerConfig)

    fastify.register(import('fastify-file-upload'), {
        responseOnLimit: {
            error: 'fileIsTooBig',
            message: 'file must be less than 2MB',
        },
        parseNested: true,
        limits: {
            fieldSize: 2 * 1024 * 1024,
            fileSize: 2 * 1024 * 1024,
        },
    })

    fastify.addSchema({
        $id: 'authReqBody',
        type: 'object',
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8, maxLength: 32 },
        },
        required: ['email', 'password'],
    })
    fastify.addSchema({
        $id: 'authResBody',
        type: 'object',
        properties: {
            userEmail: { type: 'string', format: 'email' },
            sessionId: { type: 'string', format: 'uuid' },
            sessionExpiresAt: { type: 'string', format: 'date-time' },
        },
    })
    fastify.addSchema({
        $id: 'validateAuthHeaders',
        type: 'object',
        properties: {
            authorization: {
                type: 'string',
                pattern: '^Basic [a-z0-9-]{36}$',
            },
        },
        required: ['authorization'],
    })
    fastify.addSchema({
        $id: 'emptyBody',
        type: 'null',
    })

    fastify.setErrorHandler(async (err, req, reply) => {
        if (err instanceof AppError) {
            reply.code(err.statusCode).send({
                error: err.type,
                message: err.message,
            })
            return
        }

        if (err.statusCode === 400) {
            reply.code(err.statusCode).send({
                error: 'validation',
                message: err.message,
            })
            return
        }

        console.log('Unknown error at', req.method, req.url)
        console.log(err)
        return {
            error: 'unknown',
            message: 'an unknown error occurred',
        }
    })

    fastify.register(usersController, { prefix: 'users' })
    fastify.register(productsController, { prefix: 'products' })
    console.log('Server was loaded')

    return fastify
}

export const loadDatabase = () => {
    const prisma = new PrismaClient()
    console.log('Database was loaded')
}

export const loadAll = () => {
    loadEnvVariables()
    loadDatabase()
    const server = loadServer()
    return server
}
