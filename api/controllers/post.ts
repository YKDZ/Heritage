import { PrismaClient } from "@prisma/client";
import { NextFunction, Response } from "express";
import { createError, createErrorFromCatch } from "../exceptions/CustomError";
import { VerifiedRequest } from "../utils/verifyToken";

const prisma = new PrismaClient()

// 权限：登录
export const createPost = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    delete req.body.id

    if (!req.user?.id) {
        return next(createError("参数错误", 401, "未登录"))
    }

    try {
        let publishedAt = undefined
        if (req.body.published == true) {
            publishedAt = new Date()
        }

        const post = await prisma.post.create({
            data: {
                createdAt: req.body.createdAt,
                title: req.body.title,
                published: req.body.published,
                publishedAt: publishedAt,
                content: req.body.content,
                authorId: req.user?.id,
                heritages: req.body.heritages,
                tags: {
                    create: req.body.tags.map((id: number) => ({ tag: { connect: { id } } }))
                },
                badges: {
                    create: req.body.badges.map((id: number) => ({ badge: { connect: { id } } }))
                }
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
        })

        const postWithTagIds = {
            ...post,
            tags: post.tags.map(tag => tag.tag.id),
            badges: post.badges.map(badge => badge.badge.id)
        }

        res.status(200).json(postWithTagIds)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const deletePost = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定帖子 ID"))
    }

    try {
        await prisma.$transaction(async (prisma) => {
            const target = await prisma.post.findUnique({
                where: { id }
            })

            if (!target) {
                return next(createError("未找到帖子", 404, "无法找到要删除的帖子"))
            }

            if (target.authorId !== req.user?.id && req.user?.isAdmin !== 1) {
                return next(createError("权限错误", 401, "你只能删除自己的帖子"))
            }

            // 更新与帖子相关的所有浏览历史记录的 postId 为 -1
            await prisma.viewHistory.updateMany({
                where: {
                    postId: id
                },
                data: {
                    postId: undefined
                }
            })

            // 删除帖子的所有评论
            await prisma.comment.deleteMany({
                where: {
                    postId: id
                }
            })

            // 删除帖子的标签关联
            await prisma.postTag.deleteMany({
                where: {
                    postId: id
                }
            })

            // 删除帖子的徽章关联
            await prisma.postBadge.deleteMany({
                where: {
                    postId: id
                }
            })

            // 最后删除帖子本身
            await prisma.post.delete({
                where: { id }
            })
        })

        res.status(204).send()
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getPost = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定帖子 ID"))
    }

    try {
        const post = await prisma.post.findUnique({
            where: { id },
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
        })

        if (!post) {
            return next(createError("无对应资源", 404, `帖子 ${id} 不存在`))
        }

        const postWithTagIds = {
            ...post,
            tags: post.tags.map(tag => tag.tag.id),
            badges: post.badges.map(badge => badge.badge.id)
        }

        res.json(postWithTagIds)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getPosts = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    let tag = null
    let posts = []
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 20
    const content = req.query.content as string | ""
    const published = req.query.published as string == 'true'

    if (req.query.tag) {
        tag = parseInt(req.query.tag.toString())
    }

    if (page <= 0 || limit <= 0) {
        return next(createError('参数错误', 501, '分页参数无效'))
    }

    const baseQuery = {
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

    try {
        if (content) {
            posts = await prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                ...baseQuery,
                where: {
                    content: {
                        search: content
                    },
                    title: {
                        search: content
                    },
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
                }
            })
        } else {
            posts = await prisma.post.findMany({
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
                ...baseQuery,
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
                }
            })
        }

        const postsWithTagIds = posts.map((post) => ({
            ...post,
            tags: post.tags.map((tag) => tag.tag.id),
            badges: post.badges.map((badge) => badge.badge.id)
        }))

        const totalPosts = postsWithTagIds.length | 0

        const totalPages = Math.ceil(totalPosts / limit)

        res.status(200).json({
            posts: postsWithTagIds,
            page,
            totalPages,
            totalPosts
        })
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：自己、管理员
export const updatePost = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    if (!id) {
        return next(createError("参数错误", 501, "未指定帖子 ID"))
    }

    try {
        const updatedPost = await prisma.$transaction(async (prisma) => {
            const target = await prisma.post.findUnique({
                where: { id }
            })

            if (target?.authorId != req.user?.id && req.user?.isAdmin != 1) {
                return next(createError("权限错误", 401, "你只能编辑自己的帖子"))
            }

            let publishedAt = undefined
            if (req.body.published == true && target?.published == false) {
                publishedAt = new Date()
            }

            return await prisma.post.update({
                where: { id },
                data: {
                    title: req.body.title,
                    published: req.body.published,
                    publishedAt: publishedAt,
                    authorId: req.body.authorId,
                    content: req.body.content,
                    heritages: req.body.heritages,
                    tags: {
                        deleteMany: {},
                        create: req.body.tags.map((id: number) => ({ tag: { connect: { id } } }))
                    },
                    badges: {
                        deleteMany: {},
                        create: req.body.badges.map((id: number) => ({ badge: { connect: { id } } }))
                    }
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
            })
        })

        const postWithTagIds = {
            ...updatedPost,
            tags: updatedPost?.tags.map((tag) => tag.tag.id),
            badges: updatedPost?.badges.map((badge) => badge.badge.id)
        }

        res.json(postWithTagIds)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getComments = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.id)
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10

    if (isNaN(postId) || postId <= 0) {
        return next(createError('参数错误', 501, '未指定有效的帖子 ID'))
    }

    if (page <= 0 || limit <= 0) {
        return next(createError('参数错误', 501, '分页参数无效'))
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { postId },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { createdAt: 'asc' },
            include: {
                author: true
            }
        })

        const totalComments = comments.length

        const totalPages = Math.ceil(totalComments / limit)

        res.status(200).json({
            comments,
            page,
            totalPages,
            totalComments
        })
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getTags = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    try {
        const tags = await prisma.post.findUnique({
            where: {
                id
            },
            select: {
                tags: {
                    select: {
                        tag: {
                            select: {
                                id: true,
                                title: true,
                                description: true,
                                faIcon: true,
                                iconColor: true
                            }
                        }
                    }
                }
            }
        })

        res.status(200).json(tags?.tags.map(tag => tag.tag))
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getBadges = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id)

    try {
        const badges = await prisma.post.findUnique({
            where: {
                id
            },
            select: {
                badges: {
                    select: {
                        badge: {
                            select: {
                                id: true,
                                name: true,
                                faIcon: true,
                                iconColor: true
                            }
                        }
                    }
                }
            }
        })

        res.status(200).json(badges?.badges.map(badge => badge.badge))
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getCommentAmount = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.id)

    try {
        const amount = await prisma.comment.count({
            where: { postId },
        })

        res.status(200).json(amount)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}

// 权限：无
export const getLatestComment = async (req: VerifiedRequest, res: Response, next: NextFunction) => {
    const postId = parseInt(req.params.id)

    if (isNaN(postId) || postId <= 0) {
        return next(createError('参数错误', 501, '未指定有效的帖子 ID'))
    }

    try {
        const latestComment = await prisma.comment.findFirst({
            where: { postId },
            orderBy: { createdAt: 'desc' },
            include: {
                author: true,
            },
        })

        res.status(200).json(latestComment)
    } catch (error) {
        next(createErrorFromCatch(500, error))
    }
}