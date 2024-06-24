import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcryptjs'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { createError, createErrorFromCatch } from '../exceptions/CustomError'
import { VerifiedRequest } from '../utils/verifyToken'

const prisma = new PrismaClient()

// 需要引入角色才可能对管理员账户的创建进行鉴权
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, isAdmin } = req.body

        if (!name || !email || !password) {
            return next(createError("参数错误", 500, "昵称、邮箱和密码不能为空"))
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(password, salt)

        await prisma.user.create({
            data: { name, email, password: hash, isAdmin: parseInt(isAdmin) }
        })
        res.status(204).send()
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return next(createError("无指定资源", 404, `用户 ${email} 不存在`))
        }

        const isPassword = await bcrypt.compare(password, user.password)

        if (isPassword) {
            const token = jwt.sign(
                { id: user.id, email: user.email, isAdmin: user.isAdmin, tokenVersion: user.tokenVersion },
                process.env.JWT_SECRET as string
            )

            const { password, tokenVersion, ...others } = user
            return res.cookie("access_token", token, {
                httpOnly: true
            })
                .status(200)
                .json(others)
        } else {
            return next(createError("参数错误", 502, "邮箱或密码错误"))
        }
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

export const validateToken = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    try {
        const { id, email, tokenVersion } = req.user!
        const user = await prisma.user.findUnique({
            where: { id },
        })

        if (!user || user.email !== email || user.tokenVersion !== tokenVersion) {
            return res.status(401).json({ message: '用户不存在或密码已更改' })
        }

        res.status(200).json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin })
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}