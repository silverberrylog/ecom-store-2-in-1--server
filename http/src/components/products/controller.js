import { validateAuthMiddleware } from '../users/middleware.js'
import {
    validateProductExistence,
    validateProductPhotoExistence,
} from './middleware.js'
import { baseProductSchema } from './schemas.js'
import {
    createProduct,
    deletePhoto,
    deleteProduct,
    getProducts,
    updateProduct,
    uploadPhoto,
} from './service.js'

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export const productsController = async fastify => {
    fastify.route({
        url: '/',
        method: 'POST',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            body: {
                ...baseProductSchema,
                required: [
                    'name',
                    'description',
                    'price',
                    'taxPercentage',
                    'inStock',
                    'isActive',
                ],
            },
            response: {
                200: {
                    id: { type: 'integer' },
                },
            },
        },
        preHandler: [validateAuthMiddleware],
        handler: async req => {
            const id = await createProduct(req.body)
            return { id }
        },
    })

    fastify.route({
        url: '/',
        method: 'GET',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            querystring: {
                type: 'object',
                properties: {
                    page: { type: 'string', pattern: '^[1-9][0-9]*$' },
                    query: { type: 'string' },
                    sort: { type: 'string', enum: ['asc', 'desc'] },
                    sortBy: { type: 'string', enum: ['id', 'name', 'price'] },
                },
                required: ['page', 'sort', 'sortBy'],
            },
            response: {
                200: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'integer' },
                            name: { type: 'string' },
                            price: { type: 'number', decimals: 2 },
                        },
                        required: ['id', 'name', 'price'],
                    },
                },
            },
        },
        preHandler: [validateAuthMiddleware],
        handler: async req => {
            const products = await getProducts(
                +req.query.page,
                req.query.sort,
                req.query.sortBy,
                req.query.query
            )
            return products
        },
    })

    fastify.route({
        url: '/:productId',
        method: 'PATCH',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            params: {
                type: 'object',
                properties: {
                    productId: { type: 'string', pattern: '^[0-9]+$' },
                },
                required: ['productId'],
            },
            body: {
                ...baseProductSchema,
                minProperties: 1,
            },
            response: {
                204: { $ref: 'emptyBody#' },
            },
        },
        preHandler: [
            validateAuthMiddleware,
            validateProductExistence('params', 'productId'),
        ],
        handler: async (req, reply) => {
            await updateProduct(+req.params.productId, req.body)
            reply.code(204).send()
        },
    })

    fastify.route({
        url: '/:productId',
        method: 'DELETE',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            params: {
                type: 'object',
                properties: {
                    productId: { type: 'string', pattern: '^[0-9]+$' },
                },
                required: ['productId'],
            },
            response: {
                204: { $ref: 'emptyBody#' },
            },
        },
        preHandler: [
            validateAuthMiddleware,
            validateProductExistence('params', 'productId'),
        ],
        handler: async (req, reply) => {
            await deleteProduct(+req.params.productId)
            reply.code(204).send()
        },
    })

    fastify.route({
        url: '/:productId/photos',
        method: 'POST',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            params: {
                type: 'object',
                properties: {
                    productId: { type: 'string', pattern: '^[0-9]+$' },
                },
                required: ['productId'],
            },
            body: {
                type: 'object',
                properties: {
                    file: { type: 'object' },
                },
                required: ['file'],
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'number' },
                    },
                    required: ['id'],
                },
            },
        },
        preHandler: [
            validateAuthMiddleware,
            validateProductExistence('params', 'productId'),
        ],
        handler: async req => {
            const id = await uploadPhoto(
                +req.params.productId,
                req.body.file.name,
                req.body.file.data
            )
            return { id }
        },
    })

    fastify.route({
        url: '/:productId/photos/:photoId',
        method: 'DELETE',
        schema: {
            headers: { $ref: 'validateAuthHeaders#' },
            params: {
                type: 'object',
                properties: {
                    productId: { type: 'string', pattern: '^[0-9]+$' },
                    photoId: { type: 'string', pattern: '^[0-9]+$' },
                },
                required: ['productId', 'photoId'],
            },
            response: {
                204: { $ref: 'emptyBody#' },
            },
        },
        preHandler: [
            validateAuthMiddleware,
            validateProductExistence('params', 'productId'),
            validateProductPhotoExistence('params', 'photoId'),
        ],
        handler: async (req, reply) => {
            await deletePhoto(+req.params.photoId)
            reply.code(204).send()
        },
    })
}
