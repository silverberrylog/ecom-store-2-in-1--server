import { PrismaClient } from '@prisma/client'

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
 * @param {number} productId
 * @returns {Promise<boolean>}
 */
export const productExists = async productId => {
    const count = await prisma.products.count({ where: { id: productId } })
    return count > 0
}
