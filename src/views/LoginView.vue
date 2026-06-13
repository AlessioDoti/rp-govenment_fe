<script setup>
/***
 * Login page view.
 */
import AuthLayout from '@/components/templates/AuthLayout.vue'
import LoginForm from '@/components/organisms/LoginForm.vue'
import '@/assets/css/login.css'
</script>

<template>
  <AuthLayout>
    <div class="text-center mb-4">
      <h1 class="fw-bold">Governo RP</h1>
      <p class="text-muted">Accesso Area Cittadini</p>
    </div>
    <LoginForm />
    <div class="text-center mt-4">
      <p class="text-muted mb-2">Non hai un account?</p>
      <router-link to="/signup" class="text-decoration-none me-3">Registrati</router-link>
      <span class="text-muted">|</span>
      <router-link to="/" class="text-decoration-none ms-3">← Torna alla homepage</router-link>
    </div>
  </AuthLayout>
</template>
