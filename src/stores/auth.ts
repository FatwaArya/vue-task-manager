import { defineStore } from 'pinia'

type User = { id: number; email: string } | null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: (localStorage.getItem('token') as string | null) || null,
    user: (JSON.parse(localStorage.getItem('user') || 'null') as User) || null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    authHeader: (state) => (state.token ? { Authorization: `Bearer ${state.token}` } : {}),
  },
  actions: {
    setSession(token: string, user: User) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
