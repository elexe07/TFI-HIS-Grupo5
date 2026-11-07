/**
 * Store de Tema (Pinia)
 * Maneja el modo claro/oscuro con persistencia en localStorage
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

export const useThemeStore = defineStore('theme', () => {
  // --- STATE ---
  const mode = ref<ThemeMode>('system')
  const resolvedTheme = ref<'light' | 'dark'>('light')

  // --- GETTERS ---
  const isDark = computed(() => resolvedTheme.value === 'dark')
  const isLight = computed(() => resolvedTheme.value === 'light')
  const currentMode = computed(() => mode.value)

  // --- ACTIONS ---
  function initTheme() {
    // Leer preferencia guardada
    const stored = localStorage.getItem('his_theme') as ThemeMode | null
    if (stored) {
      mode.value = stored
    }
    // Aplicar tema inicial
    applyTheme()
    // Escuchar cambios en la preferencia del sistema
    watchSystemTheme()
  }

  function setMode(newMode: ThemeMode) {
    mode.value = newMode
    localStorage.setItem('his_theme', newMode)
    applyTheme()
  }

  function toggleTheme() {
    if (mode.value === 'system') {
      // Si está en sistema, cambiar al opuesto del resuelto
      setMode(resolvedTheme.value === 'dark' ? 'light' : 'dark')
    } else {
      // Alternar entre light y dark
      setMode(mode.value === 'dark' ? 'light' : 'dark')
    }
  }

  function applyTheme() {
    let theme: 'light' | 'dark'

    if (mode.value === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      theme = mode.value
    }

    resolvedTheme.value = theme
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }

  function watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', () => {
      if (mode.value === 'system') {
        applyTheme()
      }
    })
  }

  return {
    // State
    mode,
    resolvedTheme,
    // Getters
    isDark,
    isLight,
    currentMode,
    // Actions
    initTheme,
    setMode,
    toggleTheme,
    applyTheme,
  }
}, {
  persist: {
    key: 'his_theme',
    pick: ['mode'],
    storage: localStorage,
  },
})