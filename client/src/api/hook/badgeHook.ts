import { AxiosError, AxiosResponse } from "axios"
import api from "../api"
import { ServerError } from "../../utils/ServerError"

export interface Badge {
    id: number | undefined
    name: string
    iconColor: string
    faIcon: string
}

export async function getBadges(): Promise<Badge[]> {
    return await api.get<Badge[]>(`/api/badges`)
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

export async function createBadge(comment: Badge): Promise<Badge> {
    return await api.post(`/api/badges`, {
        ...comment
    })
        .then((res: AxiosResponse<Badge>) => {
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

export async function updateBadge(badge: Badge): Promise<Badge> {
    return await api.put(`/api/badges/${badge.id}`, {
        ...badge
    })
        .then((res: AxiosResponse<Badge>) => {
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

export async function deleteBadge(id: number) {
    await api.delete(`/api/badges/${id}`)
        .catch((error: AxiosError) => {
            if (error.response) {
                const sError: ServerError = error.response.data as ServerError
                throw sError
            } else {
                throw error
            }
        })
}

export const getBadge = async (id: number): Promise<Badge> => {
    return await api.get<Badge>(`/api/badges/${id}`)
        .then((res: AxiosResponse<Badge>) => {
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