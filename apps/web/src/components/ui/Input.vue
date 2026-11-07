<script setup lang="ts">
import { computed, withDefaults } from 'vue'
import type { InputProps } from './Input.types'

const props = withDefaults(defineProps<InputProps>(), {
  error: undefined,
  hint: undefined,
  size: 'md',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  enter: []
}>()

const inputId = `input-${Math.random().toString(36).slice(2, 9)}`

const hasError = Boolean(props.error)

const ariaDescribedBy = computed((): string | undefined => {
  if (hasError) return `${inputId}-error`
  if (props.hint) return `${inputId}-hint`
  return undefined
})

const inputClasses = computed((): string => {
  const size = (props.size as string) ?? 'md'
  return 'form-input form-input-' + size
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function onEnter() {
  emit('enter')
}
</script>

<template>
  <div class="form-field">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div class="input-wrapper" :class="{ 'has-error': hasError, 'has-icon': !!$slots.prefix || !!$slots.suffix }">
      <slot name="prefix" class="input-prefix" />
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="hasError"
        :aria-describedby="ariaDescribedBy"
        :class="inputClasses"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown.enter="onEnter"
      />
      <slot name="suffix" class="input-suffix" />
    </div>

    <div v-if="hasError" :id="`${inputId}-error`" class="form-error" role="alert">
      {{ error }}
    </div>

    <div v-else-if="hint" :id="`${inputId}-hint`" class="form-hint">
      {{ hint }}
    </div>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.form-label {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text);
}

.text-danger { color: var(--color-danger); }

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input:disabled {
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.form-input::placeholder {
  color: var(--color-text-muted);
}

.form-input-sm {
  padding: var(--space-xs) var(--space-sm);
  height: 32px;
  font-size: 0.8125rem;
}

.form-input-md {
  padding: var(--space-sm) var(--space-md);
  height: 40px;
}

.form-input-lg {
  padding: var(--space-md) var(--space-lg);
  height: 48px;
  font-size: 1rem;
}

.input-prefix,
.input-suffix {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  pointer-events: none;
}

.input-prefix { left: var(--space-sm); }
.input-suffix { right: var(--space-sm); }

.has-icon .form-input {
  padding-left: 40px;
}

.has-icon .input-suffix ~ .form-input {
  padding-right: 40px;
}

.has-error .form-input {
  border-color: var(--color-danger);
}

.has-error .form-input:focus {
  box-shadow: 0 0 0 3px var(--color-danger-light);
}

.form-error {
  font-size: 0.75rem;
  color: var(--color-danger);
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
</style>