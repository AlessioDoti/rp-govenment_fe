<script setup>
/***
 * ActivityCard — card attività con lista pagamenti tasse (max 2, con ... se più di 2).
 * @prop {import('@/domain/models').Activity} activity
 * @prop {string} categoryName
 * @prop {boolean} canDelete
 * @prop {Array<{ taxAmount: number, declarationDate: string, payed: boolean }>} [payments]
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '@/components/atoms/AppCard.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'

const MAX_VISIBLE = 2

const props = defineProps({
  activity: { type: Object, required: true },
  categoryName: { type: String, required: true },
  canDelete: { type: Boolean, default: false },
  payments: { type: Array, default: () => [] }
})
const emit = defineEmits(['delete'])
const router = useRouter()

/***
 * Formatta un numero come importo (es. 1500 → "1.500 $").
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return n.toLocaleString('it-IT') + ' $'
}

/***
 * Formatta una data ISO in dd/mm/aaaa.
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('it-IT')
}

/*** @type {import('vue').ComputedRef<Array<{ amount: string, date: string, status: string }>>} */
const visiblePayments = computed(() => {
  return (props.payments || []).slice(0, MAX_VISIBLE).map((p) => ({
    amount: fmt(p.taxAmount),
    date: fmtDate(p.declarationDate),
    status: p.payed ? 'Pagata' : 'Da pagare'
  }))
})

/*** @type {import('vue').ComputedRef<boolean>} */
const hasMorePayments = computed(() => {
  return (props.payments || []).length > MAX_VISIBLE
})

function onCardClick(event) {
  if (event.target.closest('button, .btn, .btn-icon-delete')) return
  router.push({ name: 'activity-detail', params: { id: props.activity.id } })
}

function onDelete(event) {
  event.stopPropagation()
  emit('delete', props.activity)
}
</script>

<template>
  <div class="col-md-6 d-flex">
    <AppCard clickable class="position-relative flex-fill" @click="onCardClick">
      <h3>{{ activity.name }}</h3>
      <p v-if="activity.address != null" class="mb-1">Civico: <strong>{{ activity.address }}</strong></p>
      <p class="mb-2"><span class="fw-semibold">{{ categoryName }}</span></p>

      <p v-if="activity.manager">
        Responsabile: <strong>{{ activity.manager }}</strong>
      </p>

      <div v-if="payments.length > 0" class="tax-payments mb-3">
        <p class="text-muted small mb-2">
          <i class="bi bi-currency-dollar me-1" />Pagamenti tasse
        </p>
        <div
          v-for="(p, i) in visiblePayments"
          :key="i"
          class="payment-row d-flex justify-content-between align-items-center py-1"
        >
          <span class="payment-amount small">{{ p.amount }}</span>
          <span class="payment-date small">{{ p.date }}</span>
          <span
            class="payment-status small"
            :class="p.status === 'Pagata' ? 'text-success' : 'text-warning'"
          >{{ p.status }}</span>
        </div>
        <div
          v-if="hasMorePayments"
          class="payment-more text-center small mt-1"
        >…</div>
      </div>

      <AppIconButton v-if="canDelete" title="Elimina attività" @click="onDelete" />
    </AppCard>
  </div>
</template>

<style scoped>
.tax-payments {
  background: var(--bg, #f8fafc);
  border-radius: 8px;
  padding: 8px 12px;
}

.payment-row + .payment-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.payment-amount {
  color: var(--text-primary, #111827);
  font-weight: 500;
}

.payment-date {
  color: var(--text-muted, #6b7280);
}

.payment-status {
  font-weight: 500;
  white-space: nowrap;
}

[data-theme="dark"] .tax-payments {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .payment-row + .payment-row {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.payment-more {
  color: var(--text-muted, #6b7280);
  letter-spacing: 2px;
  line-height: 1;
  opacity: 0.7;
}
</style>
