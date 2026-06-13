<script setup>
/***
 * Registration page view.
 */
import AuthLayout from '@/components/templates/AuthLayout.vue'
import SignupForm from '@/components/organisms/SignupForm.vue'
import '@/assets/css/login.css'
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-4">
      <h1 class="fw-bold">Registrazione</h1>
      <p class="text-muted">Crea il tuo account</p>
    </div>
    <SignupForm />
    <div class="text-center mt-4">
      <p class="text-muted mb-2">Hai già un account?</p>
      <router-link to="/login" class="text-decoration-none">Accedi qui</router-link>
    </div>
  </AuthLayout>
</template>
