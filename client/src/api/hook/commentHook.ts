import { AxiosError, AxiosResponse } from "axios"
import api from "../api"
import { User } from "../store/user"
import { ServerError } from "../../utils/ServerError"

export interface Comment {
    id: number | undefined
    content: string
    postId: number
    createdAt: Date | undefined
    updatedAt: Date | undefined
    parentId: number | undefined
    author: User | undefined
}

export async function getComments(): Promise<Comment[]> {
    return await api.get<Comment[]>(`/api/comments`)
        .then((res: AxiosResponse<Comment[]>) => {
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

export async function createComment(comment: Comment): Promise<Comment> {
    return await api.post(`/api/comments/`, {
        ...comment
    })
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

export async function updateComment(comment: Comment): Promise<Comment> {
    return await api.put(`/api/comments/${comment.id}`, {
        ...comment
    })
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

export async function deleteComment(id: number) {
    await api.delete(`/api/comments/${id}`)
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getComment = async (id: number): Promise<Comment> => {
    return await api.get<Comment>(`/api/comments/${id}`)
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