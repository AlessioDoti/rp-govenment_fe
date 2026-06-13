<script setup>
/***
 * AppInput — input testuale con bootstrap form-control.
 * @prop {string} id
 * @prop {string} type
 * @prop {string} placeholder
 * @prop {string} modelValue
 * @prop {boolean} required
 * @prop {boolean} invalid
 * @prop {string} inputmode
 * @prop {string} autocomplete
 */
defineProps({
  id: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
  invalid: { type: Boolean, default: false },
  inputmode: { type: String, default: undefined },
  autocomplete: { type: String, default: undefined }
})

const emit = defineEmits(['update:modelValue'])

function onInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <input
    :id="id"
    :type="type"
    :class="['form-control', invalid ? 'is-invalid' : '']"
    :placeholder="placeholder"
    :required="required"
    :inputmode="inputmode"
    :autocomplete="autocomplete"
    :value="modelValue"
    @input="onInput"
  />
</template>
