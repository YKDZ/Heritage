import { AxiosError, AxiosResponse } from "axios"
import api from "../api"
import { ServerError } from "../../utils/ServerError"

export interface Tag {
    id: number | undefined
    title: string
    description: string
    iconColor: string
    faIcon: string
}

export async function getTags(): Promise<Tag[]> {
    return await api.get<Tag[]>(`/api/tags`)
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

export async function createTag(comment: Tag): Promise<Tag> {
    return await api.post(`/api/tags`, {
        ...comment
    })
        .then((res: AxiosResponse<Tag>) => {
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

export async function updateTag(tag: Tag): Promise<Tag> {
    return await api.put(`/api/tags/${tag.id}`, {
        ...tag
    })
        .then((res: AxiosResponse<Tag>) => {
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

export async function deleteTag(id: number) {
    await api.delete(`/api/tags/${id}`)
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getTag = async (id: number): Promise<Tag> => {
    return await api.get<Tag>(`/api/tags/${id}`)
        .then((res: AxiosResponse<Tag>) => {
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