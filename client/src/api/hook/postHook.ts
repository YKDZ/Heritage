import { AxiosError, AxiosResponse } from "axios"
import api from "../api"
import { ServerError } from "../../utils/ServerError"
import { User } from "../store/user"
import { CommentsData } from "../store/comments"
import { Tag } from "./tagHook"
import { Comment } from "./commentHook"
import { PostsData } from "../store/posts"
import { Badge } from "./badgeHook"

export interface Post {
    id: number | undefined
    createdAt: Date
    publishedAt: Date | undefined
    title: string
    published: boolean
    content: string
    heritages: number[]
    tags: number[]
    badges: number[]
    author: User
}

export async function getPost(id: number): Promise<Post> {
    return await api.get<Post>(`/api/posts/${id}`)
        .then((res: AxiosResponse<Post>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const deletePost = async (id: number): Promise<void> => {
    api.delete(`/api/posts/${id}`)
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export async function getPosts(published?: boolean | true, content?: string | "", tag?: Tag, page?: number, limit?: number): Promise<PostsData> {
    return await api.get<PostsData>(`/api/posts`, {
        params: {
            published, tag: tag?.id, limit, page, content
        },
    })
        .then((res: AxiosResponse<PostsData>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export async function createPost(post: Post): Promise<Post> {
    return await api.post(`/api/posts/`, {
        ...post
    })
        .then((res: AxiosResponse<Post>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                console.log(error)
                throw error
            }
        })
}

export async function updatePost(post: Post) {
    return await api.put(`/api/posts/${post.id}`, {
        ...post
    })
        .then((res: AxiosResponse<Post>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getComments = async (postId: number, page?: number, limit?: number): Promise<CommentsData> => {
    return await api.get<CommentsData>(`/api/posts/${postId}/comments`, {
        params: {
            limit, page
        }
    })
        .then((res: AxiosResponse<CommentsData>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getTags = async (postId: number) => {
    return await api.get<Tag[]>(`/api/posts/${postId}/tags`)
        .then((res: AxiosResponse<Tag[]>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getBadges = async (postId: number) => {
    return await api.get<Badge[]>(`/api/posts/${postId}/badges`)
        .then((res: AxiosResponse<Badge[]>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getCommentAmount = async (postId: number) => {
    return await api.get<number>(`/api/posts/${postId}/comment-amount`)
        .then((res: AxiosResponse<number>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getLatestComment = async (postId: number) => {
    return await api.get<Comment>(`/api/posts/${postId}/latest-comment`)
        .then((res: AxiosResponse<Comment>) => {
            return res.data
        })
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}