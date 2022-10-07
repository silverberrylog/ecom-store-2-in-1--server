import { expect } from 'chai'
import { loadAll } from '../../utils/loaders.js'
import { faker } from '@faker-js/faker'
import { errors } from './errors.js'
import { PrismaClient } from '@prisma/client'
import { getRegisterUserFunction } from '../users/test-utils.js'
import FormData from 'form-data'
import { createReadStream } from 'fs'

const server = loadAll()
const prisma = new PrismaClient()
const registerUser = getRegisterUserFunction(server)

const genProductInfo = () => ({
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.datatype.number({ max: 100, precision: 0.01 }),
    taxPercentage: faker.datatype.number({ max: 30, precision: 0.01 }),
    inStock: faker.datatype.boolean(),
    isActive: faker.datatype.boolean(),
})

const createProduct = async headers => {
    const payload = genProductInfo()

    const res = await server.inject({
        method: 'POST',
        url: '/products',
        headers,
        payload,
    })

    return [res, res.json()]
}

const uploadPhoto = async (headers, productId) => {
    const formData = new FormData()
    formData.append('file', createReadStream('test/sample-files/star.png'))

    const res = await server.inject({
        method: 'POST',
        url: `/products/${productId}/photos`,
        payload: formData,
        headers: formData.getHeaders(headers),
    })

    return [res, res.json()]
}

describe('Products route testing', () => {
    describe('Create function', () => {
        it('Should create a product', async () => {
            const [, , , headers] = await registerUser()

            const [res] = await createProduct(headers)

            expect(res.statusCode).to.eql(200)
        })
    })

    describe('Query function', () => {
        it('Should query existing products', async () => {
            const [, , , headers] = await registerUser()
            await createProduct(headers)
            await createProduct(headers)

            const res = await server.inject({
                method: 'GET',
                url: `/products`,
                headers: headers,
                query: { page: 1, sort: 'asc', sortBy: 'id' },
            })

            expect(res.statusCode).to.eql(200)
        })

        it('Should query existing products using text search', async () => {
            const [, , , headers] = await registerUser()
            await createProduct(headers)
            await createProduct(headers)

            const res = await server.inject({
                method: 'GET',
                url: `/products`,
                headers: headers,
                query: { page: 1, query: 'a', sort: 'asc', sortBy: 'id' },
            })

            expect(res.statusCode).to.eql(200)
        })
    })

    describe('Update function', () => {
        it('Should update a product', async () => {
            const [, , , headers] = await registerUser()
            const [, { id }] = await createProduct(headers)

            const { price, description } = genProductInfo()
            const res = await server.inject({
                method: 'PATCH',
                url: `/products/${id}`,
                headers,
                payload: { price, description },
            })

            expect(res.statusCode).to.eql(204)
        })
    })

    describe('Delete function', () => {
        it('Should delete a product', async () => {
            const [, , , headers] = await registerUser()
            const [, { id }] = await createProduct(headers)

            const res = await server.inject({
                method: 'DELETE',
                url: `/products/${id}`,
                headers,
            })

            expect(res.statusCode).to.eql(204)
        })

        it('Should not delete a non-existent product', async () => {
            const [, , , headers] = await registerUser()

            const nonExistentProductId = faker.datatype.number({
                min: 1000,
            })
            const res = await server.inject({
                method: 'DELETE',
                url: `/products/${nonExistentProductId}`,
                headers,
            })

            expect(res.json().error).to.eql(errors.productDoesNotExist.type)
            expect(res.statusCode).to.eql(errors.productDoesNotExist.statusCode)
        })
    })

    describe('Upload photo function', () => {
        it('Should upload a product photo', async () => {
            const [, , , headers] = await registerUser()
            const [, { id: productId }] = await createProduct(headers)

            const [res] = await uploadPhoto(headers, productId)

            expect(res.statusCode).to.eql(200)
        })
    })

    describe('Delete photo function', () => {
        it('Should delete a product photo', async () => {
            const [, , , headers] = await registerUser()
            const [, { id: productId }] = await createProduct(headers)
            const [, { id: photoId }] = await uploadPhoto(headers, productId)

            const res = await server.inject({
                method: 'DELETE',
                url: `/products/${productId}/photos/${photoId}`,
                headers,
            })

            expect(res.statusCode).to.eql(204)
        })

        it('Should not delete a non-existent product photo', async () => {
            const [, , , headers] = await registerUser()
            const [, { id: productId }] = await createProduct(headers)

            const nonExistentPhotoId = faker.datatype.number({ min: 10004 })
            const res = await server.inject({
                method: 'DELETE',
                url: `/products/${productId}/photos/${nonExistentPhotoId}`,
                headers,
            })

            expect(res.json().error).to.eql(
                errors.productPhotoDoesNotExist.type
            )
            expect(res.statusCode).to.eql(
                errors.productPhotoDoesNotExist.statusCode
            )
        })
    })
})
