<script setup>
/***
 * PublicLayout — header pubblico + main + footer.
 * Usato da HomeView, RulebookView.
 */
import AppNavbar from '@/components/organisms/AppNavbar.vue'
import AppFooter from '@/components/organisms/AppFooter.vue'
</script>

<template>
  <div class="public-wrapper">
    <AppNavbar public-layout />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.public-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.public-wrapper main {
  flex: 1;
}
</style>
