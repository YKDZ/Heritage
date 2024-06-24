import { PrismaClient } from "@prisma/client";
import { NextFunction, Response } from "express";
import { createError, createErrorFromCatch } from "../exceptions/CustomError";
import { VerifiedRequest } from "../utils/verifyToken";

const prisma = new PrismaClient()

// 权限：管理员
export const createBadge = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    if (req.user?.isAdmin != 1) {
        return next(createError("权限错误", 501, "只有管理员才能这么做"))
    }

    try {
        const cat = await prisma.badge.create({
            data: {
                name: req.body.name,
                faIcon: req.body.faIcon,
                iconColor: req.body.iconColor
            }
        })

        res.status(200).json(cat)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：管理员
export const deleteBadge = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定分类 ID"))
    }
    
    if (req.user?.isAdmin != 1) {
        return next(createError("权限错误", 501, "只有管理员才能这么做"))
    }

    try {
        prisma.badge.delete({
            where: {
                id
            }
        })

        res.status(200)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getBadges = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.badge.findMany()
        res.status(200).json(categories)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：管理员
export const updateBadge = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定分类 ID"))
    }
    
    if (req.user?.isAdmin != 1) {
        return next(createError("权限错误", 501, "只有管理员才能这么做"))
    }

    try {
        const updated = await prisma.badge.update({
            where: { id },
            data: {
                name: req.body.name,
                faIcon: req.body.faIcon
            }
        })

        res.status(200).json(updated)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}