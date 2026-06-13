<script setup>
/***
 * Login form component.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { roleDisplay } from '@/utils/format.js'
import FormField from '@/components/molecules/FormField.vue'
import AppInput from '@/components/atoms/AppInput.vue'
import AppAlert from '@/components/atoms/AppAlert.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const router = useRouter()
const { login, isLoading, error } = useAuth()

const username = ref('')
const password = ref('')

async function onSubmit() {
  try {
    await login({ username: username.value.trim(), password: password.value.trim() })
    router.push('/')
  } catch {
    // errore già in `error` reattivo
  }
}
</script>

<template>
  <form id="login-form" @submit.prevent="onSubmit">
    <AppAlert id="login-alert" :message="error || ''" variant="danger" />

    <FormField label="Username" for-id="username">
      <AppInput id="username" v-model="username" placeholder="Inserisci username" required autocomplete="username" />
    </FormField>

    <FormField label="Password" for-id="password" margin-bottom="mb-4">
      <AppInput id="password" v-model="password" type="password" placeholder="Inserisci password" required autocomplete="current-password" />
    </FormField>

    <AppButton type="submit" variant="primary" custom-class="btn-login" block :disabled="isLoading">
      Accedi
    </AppButton>
  </form>
</template>
