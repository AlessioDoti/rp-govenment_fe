<script setup>
/***
 * SearchBar — input + bottone "Cerca" (stile mockup admin-users).
 * @prop {string} modelValue
 * @prop {string} placeholder
 * @prop {string} buttonLabel
 */
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Cerca...' },
  buttonLabel: { type: String, default: 'Cerca' }
})
const emit = defineEmits(['update:modelValue', 'search'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
function onSearch() {
  emit('search', props.modelValue)
}
function onKeypress(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    emit('search', props.modelValue)
  }
}
</script>

<template>
  <div class="input-group">
    <input
      type="text"
      class="form-control"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
      @keypress="onKeypress"
    />
    <button class="btn btn-secondary" type="button" @click="onSearch">
      {{ buttonLabel }}
    </button>
  </div>
</template>
