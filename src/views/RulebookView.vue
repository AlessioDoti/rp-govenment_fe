<script setup>
/***
 * RulebookView — regolamento tasse.
 * Identica a mockup/rulebook.html.
 */
import PublicLayout from '@/components/templates/PublicLayout.vue'
import '@/assets/css/rulebook.css'
</script>

<template>
  <PublicLayout>
    <header class="header text-center">
      <div class="container">
        <h1 class="display-4 fw-bold">Regolamento Tasse Locali</h1>
        <p class="lead">Normative e modalità di pagamento per le attività commerciali RP</p>
      </div>
    </header>

    <section class="container mb-5">
      <div class="rule-card">
        <div class="mb-5">
          <h2 class="section-title">Articolo 1 - Introduzione</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div class="mb-5">
          <h2 class="section-title">Articolo 2 - Calcolo delle Tasse</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <ul>
            <li>Lorem ipsum dolor sit amet.</li>
            <li>Consectetur adipiscing elit.</li>
            <li>Sed do eiusmod tempor incididunt.</li>
            <li>Ut labore et dolore magna aliqua.</li>
          </ul>
        </div>
        <div class="mb-5">
          <h2 class="section-title">Articolo 3 - Scadenze</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div>
          <h2 class="section-title">Articolo 4 - Sanzioni</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>
