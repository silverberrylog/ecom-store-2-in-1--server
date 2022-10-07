import { faker } from '@faker-js/faker'

export const getRegisterUserFunction = server => async email => {
    const payload = {
        email: email || faker.internet.email(),
        password: faker.internet.password(),
    }

    const res = await server.inject({
        method: 'POST',
        url: '/users/register',
        payload,
    })

    return [
        res,
        res.json(),
        payload,
        { authorization: 'Basic ' + res.json().sessionId },
    ]
}
