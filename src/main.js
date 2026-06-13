/***
 * Bootstrap: Vue + Pinia + Router + Bootstrap CSS + Bootstrap Icons + design tokens.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import '@/assets/css/variables.css'
import '@/assets/css/base.css'

import App from './App.vue'
import { router } from './router/index.js'
import { api } from './services/api.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)

setInterval(() => {
  api.ensureValidToken()
}, 30000)

app.mount('#app')
