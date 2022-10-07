import { validateAuth } from './service.js'

/**
 * @param {import('fastify').FastifyRequest} req
 */
export const validateAuthMiddleware = async req => {
    await validateAuth(req.headers.authorization.replace('Basic ', ''))
}
