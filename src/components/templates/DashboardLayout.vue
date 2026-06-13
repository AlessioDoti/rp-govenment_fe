<script setup>
/***
 * DashboardLayout — navbar autenticata + main.
 * Usato dalle viste dashboard e detail.
 */
import AppNavbar from '@/components/organisms/AppNavbar.vue'
</script>

<template>
  <AppNavbar dashboard />
  <main class="container py-5">
    <slot />
  </main>
</template>
