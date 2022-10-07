import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import dayjs from 'dayjs'
import { AppError } from '../../utils/AppError.js'
import { errors } from './errors.js'

const prisma = new PrismaClient()

const genLoginInfo = async user => {
    const sessionExpiresAt = dayjs().add(7, 'days').toDate()
    const session = await prisma.sessions.create({
        data: { expiresAt: sessionExpiresAt, createdById: user.id },
    })

    return {
        userEmail: user.email,
        sessionId: session.publicId,
        sessionExpiresAt: session.expiresAt.toISOString(),
    }
}

/**
 * @typedef  {Object} LoginInfo
 * @property {string} userEmail
 * @property {string} sessionId
 * @property {Date} sessionExpiresAt
 */

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginInfo>}
 */
export const register = async (email, password) => {
    const emailIsInUse = await prisma.users.count({
        where: { email },
    })
    if (emailIsInUse) throw new AppError(errors.emailInUse)

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await prisma.users.create({
        data: { email, password: hashedPassword },
    })

    return await genLoginInfo(user)
}

/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<LoginInfo>}
 */
export const logIn = async (email, password) => {
    const user = await prisma.users.findFirst({
        where: { email },
        select: { id: true, password: true },
    })
    if (!user) throw new AppError(errors.userDoesNotExist)

    const passwordsMatch = bcrypt.compareSync(password, user.password)
    if (!passwordsMatch) throw new AppError(errors.wrongPassword)

    return await genLoginInfo(user)
}

/**
 * @param {string} token
 */
export const logOut = async token => {
    await prisma.sessions.delete({
        where: { publicId: token },
    })
}

/**
 * @param {string} token
 */
export const validateAuth = async token => {
    const session = await prisma.sessions.findFirst({
        where: { publicId: token },
        select: { expiresAt: true },
    })

    if (!session) throw new AppError(errors.tokenDoesNotExist)
    if (session.expiresAt < new Date()) {
        await prisma.sessions.delete({
            where: { publicId: token },
        })
        throw new AppError(errors.tokenExpired)
    }
}
