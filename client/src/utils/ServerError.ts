export interface ServerError extends Error {
    isSuccess: boolean,
    name: string,
    status: number,
    message: string
    stack?: string
}