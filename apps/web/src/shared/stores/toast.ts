/**
 * Store de Notificaciones Toast (Pinia)
 * Feedback visual global no intrusivo
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, 0 = no auto-close
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToastStore = defineStore('toast', () => {
  // --- STATE ---
  const toasts = ref<Toast[]>([]);

  // --- GETTERS ---
  const hasToasts = computed(() => toasts.value.length > 0);

  // --- ACTIONS ---
  function add(toast: Omit<Toast, 'id'>) {
    const id = crypto.randomUUID();
    const newToast: Toast = {
      id,
      duration: 4000,
      persistent: false,
      ...toast,
    };
    toasts.value.push(newToast);

    // Auto-remove si no es persistente
    if (!newToast.persistent && newToast.duration && newToast.duration > 0) {
      setTimeout(() => remove(id), newToast.duration);
    }

    return id;
  }

  function remove(id: string) {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      toasts.value.splice(idx, 1);
    }
  }

  function clear() {
    toasts.value = [];
  }

  // Helpers de conveniencia
  function success(title: string, message?: string, options?: Partial<Toast>) {
    return add({ type: 'success', title, message, ...options });
  }

  function error(title: string, message?: string, options?: Partial<Toast>) {
    return add({ type: 'error', title, message, duration: 6000, ...options });
  }

  function warning(title: string, message?: string, options?: Partial<Toast>) {
    return add({ type: 'warning', title, message, duration: 5000, ...options });
  }

  function info(title: string, message?: string, options?: Partial<Toast>) {
    return add({ type: 'info', title, message, ...options });
  }

  // Para errores de API
  function apiError(err: unknown, defaultTitle = 'Error') {
    let message = 'Ha ocurrido un error inesperado';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'object' && err !== null && 'mensaje' in err) {
      message = String((err as { mensaje?: string }).mensaje ?? message);
    }
    return error(defaultTitle, message);
  }

  return {
    // State
    toasts,
    // Getters
    hasToasts,
    // Actions
    add,
    remove,
    clear,
    success,
    error,
    warning,
    info,
    apiError,
  };
});
