<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { ModalProps } from './Modal.types'

const props = defineProps<ModalProps>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const overlayRef = ref<HTMLDivElement | null>(null)
const descriptionId = `modal-desc-${Math.random().toString(36).slice(2, 9)}`

const closeModal = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closable) {
    closeModal()
  }
  if (event.key === 'Tab') {
    trapFocus(event)
  }
}

const trapFocus = (event: KeyboardEvent) => {
  const focusableElements = overlayRef.value?.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusableElements?.length) return

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (!firstElement || !lastElement) return

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  // Focus first focusable element
  nextTick(() => {
    const firstFocusable = overlayRef.value?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    firstFocusable?.focus()
  })
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="modal-fade" @after-leave="$emit('update:modelValue', false)">
    <div
      v-if="modelValue"
      ref="overlayRef"
      class="modal-overlay"
      @click.self="props.closable ? closeModal() : undefined"
      @keydown="handleKeydown"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? 'modal-title' : undefined"
      :aria-describedby="descriptionId"
    >
      <div class="modal-container" :class="`modal-${size}`">
        <div class="modal-content">
          <div v-if="title || $slots.header || closable" class="modal-header">
            <slot name="header">
              <h2 v-if="title" id="modal-title" class="modal-title">{{ title }}</h2>
            </slot>
            <button
              v-if="closable"
              type="button"
              class="modal-close"
              @click="closeModal"
              aria-label="Cerrar modal"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-md);
  z-index: 1000;
  animation: fadeIn var(--transition-fast);
}

.modal-container {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  width: 100%;
  animation: slideInUp var(--transition-normal);
}

.modal-sm { max-width: 400px; }
.modal-md { max-width: 560px; }
.modal-lg { max-width: 800px; }
.modal-xl { max-width: 1024px; }
.modal-full { max-width: 95vw; }

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-md);
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.modal-close:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.modal-body {
  flex: 1;
  padding: var(--space-lg);
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--transition-fast);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>