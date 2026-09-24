import axios, { AxiosError } from 'axios'

import type { ApiEnvelope } from '@/types/api'

export const AUTH_TOKEN_KEY = 'facework_access_token'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS || 15000),
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<unknown>>) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY)
      sessionStorage.removeItem('facework_user')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    const message = error.response?.data?.message || error.message || 'Tidak dapat terhubung ke server.'
    return Promise.reject(new Error(message))
  },
)

export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}
