import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function registerGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()
    if (to.meta?.requiresAuth && !auth.isAuthenticated) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }
    return true
  })
}
