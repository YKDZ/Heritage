import { PrismaClient } from "@prisma/client"
import { NextFunction, Response } from "express"
import { createError, createErrorFromCatch } from "../exceptions/CustomError"
import { VerifiedRequest } from "../utils/verifyToken"

const prisma = new PrismaClient()

// 权限：自己、管理员
export const deleteUser = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    if (id != req.user?.id && req.user?.isAdmin != 1) {
        return next(createError("权限错误", 401, "你只能注销自己的账户"))
    }

    try {
        await prisma.user.delete({
            where: { id }
        })
        res.status(204).send()
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：登录
export const getUser = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id }
        })

        if (user) {
            const { password, isAdmin, ...other } = user
            res.json(other)
        } else {
            return next(createError("无指定资源", 404, `用户 ${id} 不存在`))
        }
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：管理员
export const getUsers = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    if (req.user?.isAdmin != 1) {
        return next(createError("权限错误", 401, "只有管理员能这么做"))
    }

    try {
        const users = await prisma.user.findMany()
        res.json(users)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const updateUser = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.params.id
    const { name, email } = req.body

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    if (id != req.user?.id && req.user?.isAdmin != 1) {
        return next(createError("权限错误", 401, "你只能更新自己的个人信息"))
    }

    if (!email) {
        return next(createError("参数错误", 501, "未指定用户邮箱"))
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email }
        })
        res.json(updatedUser)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：登录
export const getCreatedPosts = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.user?.id
    let tag = null
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const published = req.query.published as string == 'true'

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    if (req.query.tag) {
        tag = parseInt(req.query.tag.toString())
    }

    if (page <= 0 || limit <= 0) {
        return next(createError('参数错误', 501, '分页参数无效'))
    }

    try {
        const posts = await prisma.user.findUnique({
            where: {
                id: id
            },
            include: {
                createdPosts: {
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    where: {
                        published,
                        ...(tag && {
                            tags: {
                                some: {
                                    tag: {
                                        id: tag
                                    }
                                }
                            }
                        })
                    },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        tags: {
                            select: {
                                tag: {
                                    select: {
                                        id: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const postsWithTagIds = posts?.createdPosts.map((post) => ({
            ...post,
            tags: post.tags.map((tag) => tag.tag.id)
        }))

        if (postsWithTagIds) {
            const totalPosts = postsWithTagIds?.length | 0

            const totalPages = Math.ceil(totalPosts / limit)

            res.status(200).json({
                posts: postsWithTagIds,
                page,
                totalPages,
                totalPosts
            })
        } else {
            res.status(200).json({
                posts: postsWithTagIds,
                page,
                totalPages: 0,
                totalPosts: 0
            })
        }
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const getCreatedComments = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.user?.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    if (page <= 0 || limit <= 0) {
        return next(createError('参数错误', 501, '分页参数无效'))
    }

    try {
        const comments = await prisma.user.findUnique({
            where: {
                id: id
            },
            include: {
                createdComments: {
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }
            }
        })

        if (comments) {
            const totalComments = comments?.createdComments.length | 0

            const totalPages = Math.ceil(totalComments / limit)

            res.status(200).json({
                comments: comments.createdComments,
                page,
                totalComments,
                totalPages
            })
        } else {
            res.status(200).json({
                comments: [],
                page,
                totalComments: 0,
                totalPages: 0
            })
        }
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：登录
export const createViewHistory = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    const userId = req.user.id

    try {
        const history = await prisma.$transaction(async () => {
            // 一个用户最多保留 500 条历史记录
            const historyCount = await prisma.viewHistory.count({
                where: { userId }
            })
            if (historyCount >= 500) {
                const oldestHistory = await prisma.viewHistory.findMany({
                    where: { userId },
                    orderBy: { time: 'asc' },
                    take: historyCount - 499
                })

                const oldestHistoryIds = oldestHistory.map(history => history.id)

                await prisma.viewHistory.deleteMany({
                    where: {
                        id: { in: oldestHistoryIds }
                    }
                })
            }

            // 创建新的历史记录
            await prisma.viewHistory.create({
                data: {
                    postId: req.body.postId,
                    userId: userId
                }
            })
        })

        res.status(200).json(history)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const getViewHistories = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = req.user?.id
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50

    if (!id) {
        return next(createError("参数错误", 501, "未指定用户 UUID"))
    }

    if (page <= 0 || limit <= 0) {
        return next(createError('参数错误', 501, '分页参数无效'))
    }

    try {
        const histories = await prisma.user.findUnique({
            where: {
                id: req.user?.id
            },
            select: {
                histories: {
                    skip: (page - 1) * limit,
                    take: limit,
                    orderBy: { time: 'desc' },
                    select: {
                        id: true,
                        time: true,
                        post: {
                            select: {
                                id: true,
                                title: true,
                                createdAt: true,
                                publishedAt: true,
                                author: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true
                                    }
                                },
                                tags: {
                                    select: {
                                        tag: {
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                },
                                badges: {
                                    select: {
                                        badge: {
                                            select: {
                                                id: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        const mHistories = histories?.histories.map((history) => {
            return {
                ...history,
                post: {
                    ...history.post,
                    tags: history.post?.tags.map((tag) => tag.tag.id),
                    badges: history.post?.badges.map((badge) => badge.badge.id)
                }
            }
        })

        if (histories) {
            const totalHistories = histories.histories.length | 0

            const totalPages = Math.ceil(totalHistories / limit)

            res.status(200).json({
                histories: mHistories,
                page,
                totalHistories,
                totalPages
            })
        } else {
            res.status(200).json({
                histories: [],
                page,
                totalHistories: 0,
                totalPages: 0
            })
        }
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}