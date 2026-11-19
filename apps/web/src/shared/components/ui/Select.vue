<script setup lang="ts">
import { computed } from 'vue';
import type { SelectProps } from './Select.types';

const props = withDefaults(defineProps<SelectProps>(), {
  size: 'md',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}>();

const selectId = `select-${Math.random().toString(36).slice(2, 9)}`;

const hasError = computed(() => props.error !== undefined && props.error !== '');

const selectClasses = computed(() => ['form-select', `form-select-${props.size}`].join(' '));

function onInput(event: Event) {
  const target = event.target as HTMLSelectElement;
  emit('update:modelValue', target.value !== '' ? target.value : null);
}
</script>

<template>
  <div class="form-field">
    <label v-if="label" :for="selectId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div class="select-wrapper" :class="{ 'has-error': hasError }">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="hasError"
        :aria-describedby="hasError ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined"
        :class="selectClasses"
        @input="onInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <svg
        class="select-arrow"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <div v-if="hasError" :id="`${selectId}-error`" class="form-error" role="alert">
      {{ error }}
    </div>

    <div v-else-if="hint" :id="`${selectId}-hint`" class="form-hint">
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

.text-danger {
  color: var(--color-danger);
}

.select-wrapper {
  position: relative;
}

.form-select {
  width: 100%;
  appearance: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding-right: 40px;
}

.form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-select:disabled {
  background-color: var(--color-bg);
  color: var(--color-text-muted);
  cursor: not-allowed.;
}

.form-select-sm {
  padding: var(--space-xs) var(--space-sm);
  height: 32px;
  font-size: 0.8125rem;
}

.form-select-md {
  padding: var(--space-sm) var(--space-md);
  height: 40px;
}

.form-select-lg {
  padding: var(--space-md) var(--space-lg);
  height: 48px;
  font-size: 1rem;
}

.select-arrow {
  position: absolute;
  right: var(--space-sm);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  pointer-events: none;
}

.has-error .form-select {
  border-color: var(--color-danger);
}

.has-error .form-select:focus {
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
