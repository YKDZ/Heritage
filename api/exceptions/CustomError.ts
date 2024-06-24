export interface CustomError extends Error {
    status: number
}

export const createError = (name: string, status: number, message: string) => {
    const error: CustomError = { name, status, message }
    return error
}

export const createErrorFromCatch = (status: number, error: any) => {
    const rError: Error = error as Error
    const dError: CustomError = { name: rError.name, status, message: rError.message, stack: rError.stack }
    return dError
}