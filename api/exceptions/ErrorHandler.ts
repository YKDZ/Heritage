import { Response } from 'express'
import { CustomError } from './CustomError'

export class ErrorHandler {
    static handleError(err: Error, res: Response) {
        const error: CustomError = err as CustomError
        const message = error.message || "Internal server error"
        res.status(error.status).json({
            isSuccess: false,
            name: error.name,
            status: error.status,
            message: message,
            stack: error.stack
        })
    }
}