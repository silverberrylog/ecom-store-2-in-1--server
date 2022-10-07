import { AppError } from '../../utils/AppError.js'
import { errors } from './errors.js'
import { productExists } from './service.js'

/**
 * @param {'body' | 'params' | 'query' | 'headers'} locationOnReq
 * @param {string} propName
 */
export const validateProductExistence = (locationOnReq, propName) => {
    /**
     * @param {import('fastify').FastifyRequest} req
     */
    return async req => {
        const productId = req[locationOnReq][propName]

        const exists = await productExists(+productId)
        if (!exists) {
            throw new AppError(errors.productDoesNotExist)
        }
    }
}
