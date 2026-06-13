<script setup>
/***
 * CategoryCard — card categoria con scaglioni fiscali progressivi e azioni.
 * @prop {import('@/domain/models').Category} category
 * @prop {boolean} canDelete
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppCard from '@/components/atoms/AppCard.vue'
import AppIconButton from '@/components/atoms/AppIconButton.vue'

/***
 * Formatta un numero come importo senza decimali (es. 1000 → "1.000").
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—'
  return n.toLocaleString('it-IT')
}

const props = defineProps({
  category: { type: Object, required: true },
  canDelete: { type: Boolean, default: false }
})
const emit = defineEmits(['delete'])
const router = useRouter()

const MAX_VISIBLE = 3

/***
 * Descrizione testuale degli scaglioni fiscali pronta per il template.
 * @type {import('vue').ComputedRef<Array<{ range: string, rate: number }>>}
 */
const bracketLabels = computed(() => {
  const taxes = props.category.categoryTaxes || []
  if (taxes.length === 0) return []

  return taxes.slice(0, MAX_VISIBLE).map((t, i) => {
    const next = taxes[i + 1]
    const curr = fmt(t.amount)

    let range
    if (i === 0 && t.amount === 0) {
      range = next ? `fino a ${fmt(next.amount)} $` : `${curr} $`
    } else if (!next) {
      range = `oltre ${curr} $`
    } else {
      range = `da ${curr} a ${fmt(next.amount)} $`
    }

    return { range, rate: t.rate }
  })
})

/*** @type {import('vue').ComputedRef<boolean>} */
const hasMoreBrackets = computed(() => {
  return (props.category.categoryTaxes || []).length > MAX_VISIBLE
})

function onCardClick(event) {
  if (event.target.closest('button, .btn, .btn-icon-delete')) return
  router.push({ name: 'category-detail', params: { id: props.category.id } })
}

function onDelete(event) {
  event.stopPropagation()
  emit('delete', props.category)
}
</script>

<template>
  <div class="col-md-4">
    <AppCard clickable class="position-relative" @click="onCardClick">
      <h3 class="mb-3">{{ category.name }}</h3>

      <div class="tax-brackets mb-3">
        <p class="text-muted small mb-2">
          <i class="bi bi-layers me-1" />Fasce fiscali
        </p>
        <div
          v-for="(b, i) in bracketLabels"
          :key="i"
          class="bracket-row d-flex justify-content-between align-items-center py-1"
        >
          <span class="bracket-range small">{{ b.range }}</span>
          <span class="bracket-rate fw-semibold ms-2">{{ b.rate }}%</span>
        </div>
        <div
          v-if="hasMoreBrackets"
          class="bracket-more text-center small mt-1"
        >…</div>
      </div>

      <AppIconButton v-if="canDelete" title="Elimina categoria" @click="onDelete" />
    </AppCard>
  </div>
</template>

<style scoped>
.tax-brackets {
  background: var(--bg, #f8fafc);
  border-radius: 8px;
  padding: 8px 12px;
}

.bracket-row + .bracket-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.bracket-range {
  color: var(--text-muted, #6b7280);
}

.bracket-rate {
  color: var(--text-primary, #111827);
  white-space: nowrap;
}

[data-theme="dark"] .tax-brackets {
  background: rgba(255, 255, 255, 0.04);
}

[data-theme="dark"] .bracket-row + .bracket-row {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.bracket-more {
  color: var(--text-muted, #6b7280);
  letter-spacing: 2px;
  line-height: 1;
  opacity: 0.7;
}
</style>
