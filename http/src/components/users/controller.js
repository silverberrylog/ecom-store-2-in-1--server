import { validateAuthMiddleware } from './middleware.js'
import { logIn, logOut, register } from './service.js'

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export const usersController = async fastify => {
    fastify.route({
        url: '/register',
        method: 'POST',
        schema: {
            body: { $ref: 'authReqBody#' },
            response: {
                200: {
                    $ref: 'authResBody#',
                },
            },
        },
        handler: async req => {
            return await register(req.body.email, req.body.password)
        },
    })

    fastify.route({
        url: '/log-in',
        method: 'POST',
        schema: {
            body: {
                body: { $ref: 'authReqBody#' },
            },
            response: {
                200: {
                    $ref: 'authResBody#',
                },
            },
        },
        handler: async req => {
            return await logIn(req.body.email, req.body.password)
        },
    })

    fastify.route({
        url: '/log-out',
        method: 'POST',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            response: {
                204: { $ref: 'emptyBody#' },
            },
        },
        preHandler: [validateAuthMiddleware],
        handler: async (req, reply) => {
            await logOut(req.headers.authorization.replace('Basic ', ''))
            reply.code(204).send()
        },
    })
}
