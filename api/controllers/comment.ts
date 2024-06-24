import { NextFunction, Response } from "express"
import { createError, createErrorFromCatch } from "../exceptions/CustomError"
import { VerifiedRequest } from "../utils/verifyToken"
import { PrismaClient } from "@prisma/client"
import { getPost } from './post';

const prisma = new PrismaClient()

// 权限：登录
// 条件：所属帖子不是草稿
export const createComment = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    delete req.body.id

    try {
        const comment = await prisma.$transaction(async (prisma) => {
            const targetPost = await prisma.post.findUnique({
                where: {
                    id: req.body.postId
                }
            })

            if (!targetPost?.published) {
                return next(createError("条件错误", 500, "你不能对草稿发表评论"))
            }

            return await prisma.comment.create({
                data: {
                    content: req.body.content,
                    authorId: req.user?.id as string, // 已 verifyToken
                    postId: req.body.postId,
                    parentId: req.body.parentId
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    parent: {
                        select: {
                            id: true,
                            content: true
                        }
                    }
                }
            })
        })
        res.status(200).json(comment)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const deleteComment = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定评论 ID"))
    }

    try {
        await prisma.$transaction(async (prisma) => {
            const target = await prisma.comment.findUnique({
                where: { id }
            })

            if (target?.authorId != req.user?.id && req.user?.isAdmin != 1) {
                return next(createError("权限错误", 401, "你只能删除自己的评论"))
            }

            // 将所有子评论的 parentId 字段设置为 null
            // 即删除父评论却不删除子评论
            // await prisma.comment.updateMany({
            //     where: { parentId: id },
            //     data: { parentId: null }
            // })

            // 删除评论
            await prisma.comment.delete({
                where: { id }
            })
        })

        res.status(204).send()
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getComments = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.query.postId as string)

    if (!postId) {
        return next(createError("参数错误", 501, "未指定帖子 ID"))
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { postId, parentId: null },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                children: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(comments)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const updateComment = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定评论 ID"))
    }

    try {
        const updatedComment = await prisma.$transaction(async (prisma) => {
            const target = await prisma.comment.findUnique({
                where: { id }
            })

            if (target?.authorId != req.user?.id && req.user?.isAdmin != 1) {
                return next(createError("权限错误", 401, "你只能更新自己的评论"))
            }

            // 更新评论
            return await prisma.comment.update({
                where: { id },
                data: {
                    content: req.body.content,
                },
                include: {
                    author: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            })
        })

        res.json(updatedComment)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}