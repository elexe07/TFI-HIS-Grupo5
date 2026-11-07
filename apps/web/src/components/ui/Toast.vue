<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ToastProps } from './Toast.types'

const props = defineProps<ToastProps>()

const emit = defineEmits<{
  close: [id: string]
}>()

const visible = ref(true)

const toastClasses = computed(() => [
  'toast',
  `toast-${props.type}`,
].join(' '))

const iconComponent = computed(() => {
  switch (props.type) {
    case 'success': return SuccessIcon
    case 'error': return ErrorIcon
    case 'warning': return WarningIcon
    case 'info': return InfoIcon
    default: return InfoIcon
  }
})

function close() {
  visible.value = false
  setTimeout(() => emit('close', props.id), 300)
}

onMounted(() => {
  if (props.duration && props.duration > 0 && !props.persistent) {
    setTimeout(() => {
      visible.value = false
      setTimeout(() => emit('close', props.id), 300)
    }, props.duration)
  }
})

// Icon components
const SuccessIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
}
const ErrorIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
}
const WarningIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
}
const InfoIcon = {
  template: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
}
</script>

<template>
  <Transition name="toast-slide">
    <div v-if="visible" :class="toastClasses" role="alert" :aria-live="type === 'error' ? 'assertive' : 'polite'">
      <div class="toast-icon" :class="`toast-icon-${type}`">
        <component :is="iconComponent" />
      </div>

      <div class="toast-content">
        <div class="toast-header">
          <h4 class="toast-title">{{ title }}</h4>
          <button
            v-if="closable"
            type="button"
            class="toast-close"
            @click="close"
            aria-label="Cerrar notificación"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <p v-if="message" class="toast-message">{{ message }}</p>

        <div v-if="$slots.action" class="toast-action">
          <slot name="action" />
        </div>
      </div>

      <div v-if="duration && duration > 0 && !persistent" class="toast-progress">
        <div class="toast-progress-bar" :style="{ animationDuration: `${duration}ms` }"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  padding: var(--space-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border-left: 4px solid;
  min-width: 300px;
  max-width: 450px;
  animation: slideInRight var(--transition-normal);
}

.toast-success { border-color: var(--color-success); }
.toast-error { border-color: var(--color-danger); }
.toast-warning { border-color: var(--color-warning); }
.toast-info { border-color: var(--color-info); }

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast-icon-success { background-color: var(--color-success-light); color: var(--color-success); }
.toast-icon-error { background-color: var(--color-danger-light); color: var(--color-danger); }
.toast-icon-warning { background-color: var(--color-warning-light); color: var(--color-warning); }
.toast-icon-info { background-color: var(--color-info-light); color: var(--color-info); }

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-xs);
}

.toast-title {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.toast-close:hover {
  background-color: var(--color-bg);
  color: var(--color-text);
}

.toast-message {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}

.toast-action {
  margin-top: var(--space-sm);
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: transparent;
  border-radius: 0 0 var(--radius-lg) var(--radius-lg);
  overflow: hidden;
}

.toast-progress-bar {
  height: 100%;
  background-color: currentColor;
  opacity: 0.3;
  animation: progressLinear linear forwards;
}

@keyframes progressLinear {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all var(--transition-normal);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>