import { PrismaClient } from '@prisma/client'
import { s3client } from '../../utils/s3client.js'

const prisma = new PrismaClient()

/**
 * @typedef {Object} ProductInfo
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} taxPercentage
 * @property {boolean} inStock
 * @property {boolean} isActive
 */

/**
 * @param {ProductInfo} productInfo
 * @returns {Promise<number>}
 */
export const createProduct = async productInfo => {
    const { id } = await prisma.products.create({
        data: productInfo,
    })
    return id
}

/**
 * @param {number} page
 * @param {'asc', 'desc'} sort
 * @param {string} sortBy
 * @param {string?} query
 * @returns {Promise<{id: number, name: string, price: number}[]>}
 */
export const getProducts = async (page, sort, sortBy, query) => {
    const products = await prisma.products.findMany({
        where: query ? { name: { contains: query } } : {},
        orderBy: [{ [sortBy]: sort }],
        take: 25,
        skip: 25 * (page - 1),
        select: { id: true, name: true, price: true },
    })
    return products || []
}

/**
 * @param {number} productId
 * @param {Partial<ProductInfo>} productInfo
 * @returns {Promise<void>}
 */
export const updateProduct = async (productId, productInfo) => {
    await prisma.products.update({
        where: { id: productId },
        data: productInfo,
    })
}

/**
 * @param {number} productId
 * @returns {Promise<void>}
 */
export const deleteProduct = async productId => {
    await prisma.products.delete({
        where: { id: productId },
    })
}

/**
 * @param {number} productId
 * @returns {Promise<boolean>}
 */
export const productExists = async productId => {
    const count = await prisma.products.count({ where: { id: productId } })
    return count > 0
}

/**
 * @param {number} productId
 * @param {string} photoName
 * @param {Buffer} photoBuffer
 */
export const uploadPhoto = async (productId, photoName, photoBuffer) => {
    const extension = photoName.split('.').pop()
    const { id, name } = await prisma.productPhotos.create({
        data: { extension, productId },
        select: { id: true, name: true },
    })

    const finalName = name + '.' + extension
    await s3client
        .putObject({
            Bucket: process.env.PRODUCT_PHOTOS_BUCKET,
            Key: finalName,
            Body: photoBuffer,
        })
        .promise()

    return id
}

/**
 * @param {number} photoId
 */
export const deletePhoto = async photoId => {
    const { name, extension } = await prisma.productPhotos.delete({
        where: { id: photoId },
    })

    const fullName = name + '.' + extension
    await s3client
        .deleteObject({
            Bucket: process.env.PRODUCT_PHOTOS_BUCKET,
            Key: fullName,
        })
        .promise()
}

/**
 * @param {number} photoId
 * @returns {Promise<boolean>}
 */
export const photoExists = async photoId => {
    const count = await prisma.productPhotos.count({ where: { id: photoId } })
    return count > 0
}
