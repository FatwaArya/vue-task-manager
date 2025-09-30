import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import 'primeicons/primeicons.css'
import '@/assets/styles.css'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'
const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, { theme: { preset: Aura } })
app.use(ToastService)
app.use(ConfirmationService)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: { refetchOnWindowFocus: false, retry: 1 },
    },
  },
})
app.mount('#app')
