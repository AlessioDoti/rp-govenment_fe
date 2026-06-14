<script setup>
/***
 * Signup form component.
 */
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import FormField from '@/components/molecules/FormField.vue'
import AppInput from '@/components/atoms/AppInput.vue'
import AppAlert from '@/components/atoms/AppAlert.vue'
import AppButton from '@/components/atoms/AppButton.vue'

const router = useRouter()
const { register, isLoading, error } = useAuth()

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const username = ref('')
const password = ref('')
const passwordConfirm = ref('')
const birthDate = ref('')

const localError = computed(() => {
  if (password.value && passwordConfirm.value && password.value !== passwordConfirm.value) {
    return 'Le password non coincidono'
  }
  return null
})

async function onSubmit() {
  if (localError.value) return
  try {
    await register({
      firstname: firstname.value.trim(),
      lastname: lastname.value.trim(),
      birthDate: birthDate.value,
      email: email.value.trim(),
      username: username.value.trim(),
      password: password.value.trim()
    })
    router.push('/')
  } catch (err) {
    // error handled by composable
  }
}
</script>

<template>
  <form id="signup-form" @submit.prevent="onSubmit">
    <AppAlert id="signup-alert" :message="localError || error || ''" variant="danger" />

    <FormField label="Nome" for-id="firstname">
      <AppInput id="firstname" v-model="firstname" placeholder="Inserisci nome" required autocomplete="given-name" />
    </FormField>

    <FormField label="Cognome" for-id="lastname">
      <AppInput id="lastname" v-model="lastname" placeholder="Inserisci cognome" required autocomplete="family-name" />
    </FormField>

    <FormField label="Data di nascita" for-id="birthDate">
      <AppInput id="birthDate" v-model="birthDate" type="date" required />
    </FormField>

    <FormField label="Email" for-id="email">
      <AppInput id="email" v-model="email" type="email" placeholder="Inserisci email" autocomplete="email" />
    </FormField>

    <FormField label="Username" for-id="username">
      <AppInput id="username" v-model="username" placeholder="Inserisci username" required autocomplete="username" />
    </FormField>

    <FormField label="Password" for-id="password">
      <AppInput id="password" v-model="password" type="password" placeholder="Inserisci password" required autocomplete="new-password" />
    </FormField>

    <FormField label="Conferma Password" for-id="password-confirm" margin-bottom="mb-4">
      <AppInput id="password-confirm" v-model="passwordConfirm" type="password" placeholder="Inserisci nuovamente la password" required autocomplete="new-password" />
    </FormField>

    <AppButton type="submit" variant="primary" custom-class="btn-login" block :disabled="isLoading || !!localError">
      Registrati
    </AppButton>
  </form>
</template>

<style scoped>
#birthDate::-webkit-calendar-picker-indicator {
  cursor: pointer;
}
</style>

<style>
[data-theme="dark"] #birthDate::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
