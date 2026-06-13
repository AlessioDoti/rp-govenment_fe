/***
 * clickPosition — tiene traccia dell'ultima posizione Y del click per posizionare
 * le modali vicino al punto in cui l'utente ha cliccato.
 * Ignora i click all'interno di modali già aperte per non spostarle.
 */
import { ref } from 'vue'

/*** @type {import('vue').Ref<number>} */
export const lastClickY = ref(0)

/***
 * Avvia l'ascolto dei click globali.
 * Va chiamata una sola volta, tipicamente in App.vue onMounted.
 */
export function initClickTracker() {
  if (typeof document !== 'undefined') {
    document.addEventListener('mousedown', (e) => {
      // Se il click è dentro una modale già aperta, non aggiornare la posizione
      if (e.target && /** @type {Element} */ (e.target).closest('.modal')) return
      lastClickY.value = e.clientY
    })
  }
}
