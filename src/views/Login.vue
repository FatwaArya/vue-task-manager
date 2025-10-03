<script setup lang="ts">
defineOptions({ name: 'LoginView' })
import { ref } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import Divider from 'primevue/divider'
import Checkbox from 'primevue/checkbox'

const email = ref('')
const password = ref('')
const loading = ref(false)
const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const toast = useToast()

async function onSubmit() {
  loading.value = true
  try {
    const res = await axios.post('/api/login', { email: email.value, password: password.value })
    console.log(res.data)
    auth.setSession(res.data.data.token, res.data.data.user)
    toast.add({ severity: 'success', summary: 'Logged in', life: 1500 })
    const redirect = (route.query.redirect as string) || '/tasks'
    router.replace(redirect)
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    toast.add({
      severity: 'error',
      summary: err?.response?.data?.message || 'Login failed',
      life: 2500,
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4 md:p-6 flex justify-center">
    <Toast />
    <Card class="w-full max-w-md">
      <template #title>
        <div class="flex items-center gap-2">
          <i class="pi pi-user" />
          <span>Welcome back</span>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm">Email</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm">Password</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggleMask
              inputClass="w-full"
              required
            />
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Checkbox inputId="remember" binary />
              <label for="remember">Remember me</label>
            </div>
            <a class="text-primary-600 text-sm" href="#">Forgot password?</a>
          </div>
          <Button type="submit" :loading="loading" label="Sign in" icon="pi pi-sign-in" />
          <Divider />
          <div class="text-sm text-muted-color">Use your account to access your tasks.</div>
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped></style>
