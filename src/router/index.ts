import { createRouter, createWebHistory } from 'vue-router'
import { registerGuards } from './guards'

export const routes = [
  { path: '/', redirect: '/tasks' },
  { path: '/login', component: () => import('@/views/Login.vue') },
  { path: '/tasks', component: () => import('@/views/Tasks.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

registerGuards(router)

export default router
