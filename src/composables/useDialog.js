/***
 * useDialog — API Promise-based per mostrare dialog modali custom.
 * Allineata all'API del ModalDialog del mockup, ma con un'unica istanza
 * reattiva montata a livello app (vedi CustomModal organism).
 *
 * Esempio:
 *   const dialog = useDialog()
 *   await dialog.alert('Titolo', 'Messaggio')
 *   if (await dialog.confirm('Titolo', 'Sei sicuro?')) { ... }
 *   const value = await dialog.prompt('Titolo', 'Inserisci valore', 'default')
 */

import { useDialogStore } from '@/stores/dialog.js'

export function useDialog() {
  const store = useDialogStore()

  /***
   * @param {string} title
   * @param {string} message
   * @returns {Promise<void>}
   */
  function alert(title, message) {
    return new Promise((resolve) => {
      store.openDialog({ variant: 'alert', title, message, resolve })
    })
  }

  /***
   * @param {string} title
   * @param {string} message
   * @returns {Promise<boolean>}
   */
  function confirm(title, message) {
    return new Promise((resolve) => {
      store.openDialog({ variant: 'confirm', title, message, resolve })
    })
  }

  /***
   * @param {string} title
   * @param {string} message
   * @param {string} [defaultValue]
   * @returns {Promise<string|null>}
   */
  function prompt(title, message, defaultValue = '') {
    return new Promise((resolve) => {
      store.openDialog({ variant: 'prompt', title, message, defaultValue, resolve })
    })
  }

  /***
   * @param {string} title
   * @returns {Promise<string|null>} nome dipendente, oppure null se annullato
   */
  function addEmployee(title) {
    return new Promise((resolve) => {
      store.openDialog({ variant: 'addEmployee', title, resolve })
    })
  }

  /***
   * @param {string} title
   * @param {string[]} employees
   * @returns {Promise<string|null>} nome dipendente selezionato, oppure null se annullato
   */
  function removeEmployee(title, employees) {
    return new Promise((resolve) => {
      store.openDialog({ variant: 'removeEmployee', title, employeeOptions: employees, resolve })
    })
  }

  /***
   * @param {string} title
   * @param {string} activityName
   * @param {string} categoryName
   * @returns {Promise<{ name: string, category: string }|null>}
   */
function editActivity(title, activityName, categoryName) {
  return new Promise(async (resolve) => {
    const categories = await (await import('@/services/api.js')).api.getCategories()
    store.openDialog({
      variant: 'editActivity',
      title,
      activityName,
      categoryName,
      categories,
      resolve
    })
  })
}

  return { alert, confirm, prompt, addEmployee, removeEmployee, editActivity }
}
