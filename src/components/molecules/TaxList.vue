<script setup>
/***
 * Tax list component (molecule).
 * @prop {{ taxId:number, taxAmount:number, declarationDate:string, payed:boolean, managerName:string }[]} taxes
 * @prop {boolean} [canTogglePayed=false]
 */
defineProps({
  taxes: { type: Array, required: true },
  canTogglePayed: { type: Boolean, default: false }
})

const emit = defineEmits(['toggle-payed'])

function fmtAmount(v){ return Number(v).toLocaleString('it-IT') + ' $' }
function fmtDate(d){ return new Date(d).toLocaleDateString('it-IT') }
</script>

<template>
  <div class="tax-list">
    <div v-for="(t,i) in taxes" :key="t.taxId || i" class="tax-row py-2 px-3 mb-1">
      <div class="d-flex justify-content-between align-items-center">
        <span class="tax-amount fw-semibold">{{ fmtAmount(t.taxAmount) }}</span>
        <span class="badge"
              :class="[t.payed ? 'bg-success' : 'bg-warning text-dark', canTogglePayed ? 'badge-clickable' : '']"
              :title="canTogglePayed ? (t.payed ? 'Clicca per riaprire' : 'Clicca per marcare come pagata') : undefined"
              @click="canTogglePayed && emit('toggle-payed', t)">
          {{ t.payed ? 'Pagata' : 'Da pagare' }}
        </span>
      </div>
      <div class="d-flex justify-content-between small text-muted mt-1">
        <span>{{ fmtDate(t.declarationDate) }}</span>
        <span>Manager: <strong>{{ t.managerName }}</strong></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tax-row { background: var(--bg, #f8fafc); border-radius: 8px; }
.tax-row + .tax-row { margin-top: 4px; }
[data-theme="dark"] .tax-row { background: rgba(255,255,255,.04); }

.badge-clickable {
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.badge-clickable:hover {
  opacity: 0.8;
  transform: scale(1.05);
}
</style>
