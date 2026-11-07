<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import Toast from './Toast.vue'

const toastStore = useToastStore()
</script>

<template>
  <div class="toast-container" aria-live="polite" aria-atomic="true">
    <Toast
      v-for="toast in toastStore.toasts"
      :key="toast.id"
      :id="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      :persistent="toast.persistent"
      :closable="true"
      @close="toastStore.remove"
    >
      <template v-if="toast.action" #action>
        <Button :variant="toast.type === 'error' ? 'danger' : 'primary'" size="sm" @click="toast.action.onClick">
          {{ toast.action.label }}
        </Button>
      </template>
    </Toast>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 450px;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

@media (max-width: 480px) {
  .toast-container {
    left: var(--space-md);
    right: var(--space-md);
    max-width: none;
  }
}
</style>