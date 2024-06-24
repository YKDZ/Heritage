import { AxiosError, AxiosResponse } from "axios"
import api from "../api"
import { ServerError } from "../../utils/ServerError"
import { User } from "../store/user"
import { Post } from "./postHook"
import { Tag } from "./tagHook"
import { PostsData } from "../store/posts"
import { CommentsData } from "../store/comments"

export interface ViewHistory {
    id: number
    time: Date
    post: Post
}

export async function getUser(id: string): Promise<User> {
    return await api.get<User>(`/api/users/${id}`)
        .then((res: AxiosResponse<User>) => {
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

export async function getCreatedPosts(published?: boolean | true, tag?: Tag, page?: number, limit?: number): Promise<PostsData> {
    return await api.get<PostsData>(`/api/users/created/posts`, {
        params: {
            published, page, limit, tag
        }
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

export async function getCreatedComments(page?: number, limit?: number): Promise<CommentsData> {
    return await api.get<CommentsData>(`/api/users/created/comments`, {
        params: {
            page, limit
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

export const createHistory = async (postId: number) => {
    return await api.post<ViewHistory>(`/api/users/histories`, {
        postId
    })
        .then((res: AxiosResponse<ViewHistory>) => {
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

export interface ViewHistoriesData {
    histories: ViewHistory[]
    page: number
    totalHistories: number
    totalPages: number
}

export const getViewHistories = async (page?: number, limit?: number) => {
    return await api.get<ViewHistoriesData>(`/api/users/histories`, {
        params: {
            page, limit
        }
    })
        .then((res: AxiosResponse<ViewHistoriesData>) => {
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