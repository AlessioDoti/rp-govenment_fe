<script setup>
/***
 * AuthLayout — layout centrato per Login e Signup.
 */
import AppNavbar from '@/components/organisms/AppNavbar.vue'
</script>

<template>
  <AppNavbar public-layout />
  <div class="page-content">
    <div class="login-box">
      <slot />
    </div>
  </div>
</template>
