import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AxiosError, AxiosResponse } from 'axios'
import api from '../api'
import { ServerError } from '../../utils/ServerError'
import router from '../../router/router'

export interface User {
  id: string
  name: string
  email: string
  isAdmin: number
  registeredAt: Date
  joinedEvents: Event[]
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = ref<boolean>(false)

  const setUser = (userData: User | null): void => {
    user.value = userData
    isAuthenticated.value = !!userData
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user')
    }
  }

  const initializeAuth = async () => {
    const storedUserData = localStorage.getItem('user')
    if (storedUserData) {
      await validateToken()
        .catch((error) => {
          router.push('/login')
        })
    }
  }

  const register = async (name: string, email: string, password: string, isAdmin: number) => {
    try {
      await api.post('/api/auth/register', {
        name,
        email,
        password,
        isAdmin,
      })
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          const sError: ServerError = error.response.data as ServerError
          throw sError
        } else {
          throw error
        }
      } else {
        throw error
      }
    }
  }

  const login = async (email: String, password: String) => {
    await api.post<User>('/api/auth/login', {
      email, password
    })
      .then((res: AxiosResponse) => {
        setUser(res.data)
      })
      .catch((error: AxiosError<ServerError>) => {
        if (error.response) {
          const sError: ServerError = error.response.data as ServerError
          throw sError
        } else {
          throw error
        }
      })
  }

  const validateToken = async () => {
    await api.post<User>('/api/auth/validate-token')
      .then((res: AxiosResponse) => {
        setUser(res.data)
      })
      .catch((error: AxiosError<ServerError>) => {
        logout()
        if (error.response) {
          const sError: ServerError = error.response.data as ServerError
          throw sError
        } else {
          throw error
        }
      })
  }

  const logout = (): void => {
    setUser(null)
  }

  const joinEvent = async (eventId: number) => {
    await api.put<Event[]>(`/api/users/join/${eventId}`)
      .catch((error: AxiosError) => {
        if (error.response) {
          const sError: ServerError = error.response.data as ServerError
          throw sError
        } else {
          console.log(error)
        }
      })
  }

  const leaveEvent = async (eventId: number) => {
    await api.put<Event[]>(`/api/users/leave/${eventId}`)
      .catch((error: AxiosError) => {
        if (error.response) {
          const sError: ServerError = error.response.data as ServerError
          throw sError
        } else {
          console.log(error)
        }
      })
  }

  return {
    user,
    isAuthenticated,
    setUser,
    initializeAuth,
    register,
    login,
    validateToken,
    logout,
    joinEvent,
    leaveEvent
  }
})