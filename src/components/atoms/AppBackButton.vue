<script setup>
/***
 * AppBackButton — back button con stile scoped identico al mockup (.back-btn).
 * @prop {string} to - destinazione router-link
 * @prop {string} icon - nome icona bootstrap-icons
 */
defineProps({
  to: { type: String, required: true },
  icon: { type: String, default: 'arrow-left' }
})
</script>

<template>
  <router-link :to="to" class="back-btn" aria-label="Torna indietro">
    <i :class="['bi', `bi-${icon}`]" />
  </router-link>
</template>

<style scoped>
.back-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--text-primary);
    font-size: 1.2rem;
    transition: all 0.2s ease;
    margin-left: -5.8rem;
    margin-top: 1.5rem;
    margin-right: 2rem;
}

.back-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    transform: translateX(-2px);
    color: var(--text-primary);
}

.back-btn i {
    line-height: 1;
}

@media (max-width: 768px) {
    .back-btn {
        width: 42px;
        height: 42px;
        margin: 1rem 0.75rem 0.25rem 0.75rem;
        font-size: 1rem;
    }
}
</style>
