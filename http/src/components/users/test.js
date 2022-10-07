import { expect } from 'chai'
import { loadAll } from '../../utils/loaders.js'
import { faker } from '@faker-js/faker'
import { errors } from './errors.js'
import { PrismaClient } from '@prisma/client'
import { getRegisterUserFunction } from './test-utils.js'

const server = loadAll()
const prisma = new PrismaClient()

const registerUser = getRegisterUserFunction(server)

describe('Users route testing', () => {
    describe('Register function', () => {
        it('Should register a user', async () => {
            const [res] = await registerUser()

            expect(res.statusCode).to.eql(200)
        })

        it('Should not register a user when the email is already in use', async () => {
            const [, { userEmail: emailInUse }] = await registerUser()

            const [res, resBody] = await registerUser(emailInUse)

            expect(resBody.error).to.eql(errors.emailInUse.type)
            expect(res.statusCode).to.eql(errors.emailInUse.statusCode)
        })
    })

    describe('Login function', () => {
        it('Should log in a user', async () => {
            const [, , loginInfo] = await registerUser()

            const res = await server.inject({
                method: 'POST',
                url: '/users/log-in',
                payload: loginInfo,
            })

            expect(res.statusCode).to.eql(200)
        })

        it('Should not log in when there is no user with the given email', async () => {
            const res = await server.inject({
                method: 'POST',
                url: '/users/log-in',
                payload: {
                    email: faker.internet.email(),
                    password: faker.internet.password(),
                },
            })

            expect(res.json().error).to.eql(errors.userDoesNotExist.type)
            expect(res.statusCode).to.eql(errors.userDoesNotExist.statusCode)
        })

        it('Should not log in when the given password is wrong', async () => {
            const [, , loginInfo] = await registerUser()

            const res = await server.inject({
                method: 'POST',
                url: '/users/log-in',
                payload: {
                    email: loginInfo.email,
                    password: faker.internet.password(),
                },
            })

            expect(res.json().error).to.eql(errors.wrongPassword.type)
            expect(res.statusCode).to.eql(errors.userDoesNotExist.statusCode)
        })
    })

    describe('Logout function', () => {
        it('Should log out a user', async () => {
            const [, { sessionId }] = await registerUser()

            const res = await server.inject({
                method: 'POST',
                url: '/users/log-out',
                headers: {
                    authorization: 'Basic ' + sessionId,
                },
            })

            expect(res.statusCode).to.eql(204)
        })

        it('Should not log out when the session does not exist', async () => {
            const res = await server.inject({
                method: 'POST',
                url: '/users/log-out',
                headers: {
                    authorization: 'Basic ' + faker.datatype.uuid(),
                },
            })

            expect(res.json().error).to.eql(errors.tokenDoesNotExist.type)
            expect(res.statusCode).to.eql(errors.tokenDoesNotExist.statusCode)
        })

        it('Should not log out when the session is expired', async () => {
            const [, { sessionId }] = await registerUser()
            await prisma.sessions.update({
                where: { publicId: sessionId },
                data: { expiresAt: faker.date.recent() },
            })

            const res = await server.inject({
                method: 'POST',
                url: '/users/log-out',
                headers: {
                    authorization: 'Basic ' + sessionId,
                },
            })

            expect(res.json().error).to.eql(errors.tokenExpired.type)
            expect(res.statusCode).to.eql(errors.tokenExpired.statusCode)
        })
    })
})
