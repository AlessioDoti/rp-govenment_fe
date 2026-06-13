/***
 * Dialog store — stato reattivo del modal custom montato a livello app.
 * Espone il modello "variant" per supportare alert / confirm / prompt /
 * addEmployee / removeEmployee / editActivity.
 */

import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'

/***
 * @typedef {'alert' | 'confirm' | 'prompt' | 'addEmployee' | 'removeEmployee' | 'editActivity'} DialogVariant
 *
 * @typedef {Object} DialogState
 * @property {boolean} open
 * @property {DialogVariant} variant
 * @property {string} title
 * @property {string} message
 * @property {string} defaultValue
 * @property {string[]} [employeeOptions]
 * @property {string} [activityName]
 * @property {string} [categoryName]
 * @property {Array<any>} [categories]
 * @property {(value: any) => void} resolve
 * @property {(reason?: any) => void} reject
 */

export const useDialogStore = defineStore('dialog', () => {
  const open = ref(false)
  const variant = ref(/** @type {DialogVariant} */ ('alert'))
  const title = ref('')
  const message = ref('')
  const defaultValue = ref('')
  const employeeOptions = ref(/** @type {string[]} */ ([]))
  const activityName = ref('')
  const categoryName = ref('')
  const categories = ref(/** @type {Array<any>} */ ([]))

  const resolver = shallowRef(/** @type {((value: any) => void) | null} */ (null))

  function openDialog(state) {
    variant.value = state.variant
    title.value = state.title
    message.value = state.message ?? ''
    defaultValue.value = state.defaultValue ?? ''
    employeeOptions.value = state.employeeOptions ?? []
    activityName.value = state.activityName ?? ''
    categoryName.value = state.categoryName ?? ''
    categories.value = state.categories ?? []
    resolver.value = state.resolve
    open.value = true
  }

  /*** @param {any} value */
  function resolve(value) {
    const r = resolver.value
    resolver.value = null
    open.value = false
    if (r) r(value)
  }

  function cancel() {
    const r = resolver.value
    resolver.value = null
    open.value = false
    if (r) r(null)
  }

  return {
    open,
    variant,
    title,
    message,
    defaultValue,
    employeeOptions,
    activityName,
    categoryName,
    categories,
    openDialog,
    resolve,
    cancel
  }
})
