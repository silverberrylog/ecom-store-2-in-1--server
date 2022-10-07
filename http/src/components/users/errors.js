export const errors = {
    emailInUse: {
        type: 'emailInUse',
        message: 'email is already in use',
        statusCode: 400,
    },
    userDoesNotExist: {
        type: 'userDoesNotExist',
        message: 'there is no user with the given email',
        statusCode: 400,
    },
    wrongPassword: {
        type: 'wrongPassword',
        message: 'wrong password',
        statusCode: 400,
    },
    tokenDoesNotExist: {
        type: 'tokenDoesNotExist',
        message: 'you must be logged in to perform that action',
        statusCode: 401
    },
    tokenExpired: {
        type: 'tokenExpired',
        message: 'you must be logged in to perform that action',
        statusCode: 401
    },
}
