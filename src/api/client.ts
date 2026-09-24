import axios, { AxiosError } from 'axios'

import type { ApiEnvelope } from '@/types/api'

export const AUTH_TOKEN_KEY = 'facework_access_token'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly requestId?: string,
    public readonly retriable = false,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function fallbackMessage(status?: number) {
  if (status === 404) return 'Data yang diminta tidak ditemukan.'
  if (status === 409) return 'Permintaan bertentangan dengan data yang sudah tercatat.'
  if (status === 422) return 'Data belum lengkap atau formatnya belum sesuai.'
  if (status && status >= 500)
    return 'Server sedang mengalami gangguan. Coba kembali beberapa saat lagi.'
  return 'Tidak dapat terhubung ke server.'
}

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
    const status = error.response?.status
    if (status === 401) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY)
      sessionStorage.removeItem('facework_user')
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    const meta = error.response?.data?.meta
    const requestId =
      (typeof meta?.request_id === 'string' ? meta.request_id : undefined) ||
      (typeof error.response?.headers['x-request-id'] === 'string'
        ? error.response.headers['x-request-id']
        : undefined)
    const retriable = !error.response || error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    const message = error.response?.data?.message || fallbackMessage(status)
    return Promise.reject(
      new ApiError(message, status, error.response?.data?.code, requestId, retriable),
    )
  },
)

export async function withNetworkRetry<T>(request: () => Promise<T>): Promise<T> {
  const delays = [500, 1500]
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await request()
    } catch (reason) {
      if (!(reason instanceof ApiError) || !reason.retriable || attempt >= delays.length)
        throw reason
      await new Promise((resolve) => setTimeout(resolve, delays[attempt]))
    }
  }
}

export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}
