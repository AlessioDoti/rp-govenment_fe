/***
 * Helpers di formattazione riusabili (puri, senza dipendenze da Vue).
 */

/*** @param {import('@/domain/models').Role} role */
export function roleDisplay(role) {
  const map = {
    ADMIN: 'Admin Governo',
    GOVERNMENT: 'Membro del Governo',
    ACTIVITY_MANAGER: 'Gestore Attività',
    CITIZEN: 'Cittadino'
  }
  return map[role] || role
}

/*** @param {number} value */
export function formatCurrency(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

/*** @param {string} categoryId @param {import('@/domain/models').Category[]} categories */
export function categoryNameOf(categoryId, categories) {
  const c = categories.find((x) => x.id === categoryId)
  return c ? c.name : categoryId
}
