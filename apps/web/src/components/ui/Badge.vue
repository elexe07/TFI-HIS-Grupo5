<script setup lang="ts">
import { computed } from 'vue';
import type { BadgeProps } from './Badge.types';

const props = defineProps<BadgeProps>();

const badgeClasses = computed(() =>
  ['badge', `badge-${props.variant}`, `badge-${props.size}`, { 'badge-dot': props.dot }]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  font-weight: 500;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.badge-sm {
  padding: 0 var(--space-xs);
  font-size: 0.6875rem;
  height: 20px;
}

.badge-md {
  padding: 0 var(--space-sm);
  font-size: 0.75rem;
  height: 24px;
}

.badge-lg {
  padding: 0 var(--space-md);
  font-size: 0.8125rem;
  height: 28px;
}

.badge-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  opacity: 0.8;
}

/* Variants */
.badge-primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}
.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success);
}
.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning);
}
.badge-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger);
}
.badge-info {
  background-color: var(--color-info-light);
  color: var(--color-info);
}
.badge-neutral {
  background-color: var(--color-border);
  color: var(--color-text-secondary);
}

/* Full rounded */
:where(.badge) {
  --radius-full: 9999px;
}
</style>
