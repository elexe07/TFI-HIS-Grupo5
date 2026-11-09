<script setup lang="ts">
import { computed } from 'vue';
import type { ButtonProps } from './Button.types';

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  block: false,
  loading: false,
  label: '',
  type: 'button',
  disabled: false,
});

const buttonClasses = computed(() =>
  [
    'btn',
    `btn-${props.variant}`,
    `btn-${props.size}`,
    { 'btn-block': props.block },
    { 'btn-loading': props.loading },
    { 'btn-disabled': props.disabled },
  ].join(' '),
);
</script>

<template>
  <button :type="props.type" :disabled="props.disabled || props.loading" :class="buttonClasses">
    <span v-if="props.loading" class="button-spinner" aria-hidden="true"></span>
    <slot v-else />
    <span v-if="!props.loading && !$slots.default">{{ props.label }}</span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  text-decoration: none;
}

.btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.btn-disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}

.btn-outline:hover:not(:disabled) {
  background-color: var(--color-primary-light);
}

.btn-ghost {
  background-color: transparent;
  color: var(--color-text);
}

.btn-ghost:hover:not(:disabled) {
  background-color: var(--color-border);
}

.btn-danger {
  background-color: var(--color-danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #b91c1c;
}

.btn-success {
  background-color: var(--color-success);
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #047857;
}

/* Sizes */
.btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: 0.8125rem;
  height: 32px;
}

.btn-md {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
  height: 40px;
}

.btn-lg {
  padding: var(--space-md) var(--space-lg);
  font-size: 1rem;
  height: 48px;
}

.btn-block {
  width: 100%;
}

/* Loading spinner */
.btn-loading {
  position: relative;
  color: transparent !important;
}

.btn-loading .btn-content {
  visibility: hidden;
}

.button-spinner {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  color: inherit;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
