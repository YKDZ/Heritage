import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { createError } from '../exceptions/CustomError'

export interface VerifiedRequest extends Request {
    user?: {
        id: string
        email: string
        isAdmin: number
        tokenVersion: number
    }
}

export interface DecodedToken {
    id: string
    email: string
    isAdmin: number
    tokenVersion: number
}

export const verifyToken = (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token

    if (!token) {
        return next(createError("权限错误", 401, "未登录"))
    }

    jwt.verify(token, process.env.JWT_SECRET as string, (err: any, token: any) => {
        if (err) {
            return next(createError("令牌错误", 403, "令牌无效"))
        }
        const decoded = token as DecodedToken
        req.user = { id: decoded.id, email: decoded.email, isAdmin: decoded.isAdmin, tokenVersion: decoded.tokenVersion }
        next()
    })
}