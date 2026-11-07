<script setup lang="ts">
import { computed } from 'vue'
import type { CardProps } from './Card.types'

const props = defineProps<CardProps>()

defineSlots<{
  default: () => any
  header: () => any
  footer: () => any
}>()

const cardClasses = computed(() => [
  'card',
  { 'card-hover': props.hoverable },
  { 'card-bordered': props.bordered !== false },
  props.class,
].filter(Boolean).join(' '))
</script>

<template>
  <div :class="cardClasses">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>

    <div class="card-body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-bordered {
  border: 1px solid var(--color-border);
}

.card-hover {
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.card-hover:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md);
}

.card-body {
  padding: var(--space-lg);
  flex: 1;
}

.card-footer {
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
}
</style>