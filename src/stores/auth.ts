import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { authApi } from '@/api/services'
import { AUTH_TOKEN_KEY } from '@/api/client'
import type { LoginData } from '@/types/api'

const USER_KEY = 'facework_user'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<LoginData | null>(null)
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() =>
    Boolean(user.value && sessionStorage.getItem(AUTH_TOKEN_KEY)),
  )
  const employee = computed(() => user.value?.employee ?? null)

  function hydrate() {
    const saved = sessionStorage.getItem(USER_KEY)
    if (!saved || !sessionStorage.getItem(AUTH_TOKEN_KEY)) return
    try {
      user.value = JSON.parse(saved) as LoginData
    } catch {
      logout()
    }
  }

  async function login(payload: {
    username: string
    password: string
    odoo_base_url?: string
    odoo_db?: string
  }) {
    loading.value = true
    error.value = ''
    try {
      const result = await authApi.login(payload)
      sessionStorage.setItem(AUTH_TOKEN_KEY, result.access_token)
      sessionStorage.setItem(USER_KEY, JSON.stringify(result))
      user.value = result
      return result
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : 'Login gagal.'
      throw reason
    } finally {
      loading.value = false
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    user.value = null
  }

  return { user, employee, loading, error, isAuthenticated, hydrate, login, logout }
})
