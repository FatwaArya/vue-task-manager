<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Menubar from 'primevue/menubar'

const router = useRouter()
const auth = useAuthStore()

const items = computed(() => {
  const base = [{ label: 'Tasks', icon: 'pi pi-list-check', command: () => router.push('/tasks') }]
  if (auth.isAuthenticated) {
    return [
      ...base,
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          auth.clearSession()
          router.push('/login')
        },
      },
    ]
  }
  return [...base, { label: 'Login', icon: 'pi pi-user', command: () => router.push('/login') }]
})
</script>

<template>
  <header class="border-b">
    <div class="max-w-6xl mx-auto px-4">
      <Menubar :model="items" class="border-none bg-transparent">
        <template #start>
          <div class="flex items-center gap-2 py-3 select-none">
            <i class="pi pi-check-square text-primary-600" />
            <span class="font-semibold tracking-wider uppercase">Task Manager</span>
          </div>
        </template>
      </Menubar>
    </div>
  </header>
  <main class="max-w-6xl mx-auto p-4 md:p-6">
    <RouterView />
  </main>
</template>

<style scoped></style>
