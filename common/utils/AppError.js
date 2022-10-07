export class AppError extends Error {
    type
    message
    statusCode

    constructor({ type, message, statusCode }) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)

        this.type = type
        this.message = message
        this.statusCode = statusCode

        Error.captureStackTrace(this)
    }
}
