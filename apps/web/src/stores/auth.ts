/**
 * Store de Autenticación (Pinia)
 * Maneja token JWT, usuario autenticado, permisos y persistencia
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/services/api'
import type { UsuarioAutenticado, Permiso, NombreRol } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  // --- STATE ---
  const token = ref<string | null>(localStorage.getItem('his_token'))
  const usuario = ref<UsuarioAutenticado | null>(null)
  const usuariosSistema = ref<UsuarioAutenticado[]>([])
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // --- GETTERS ---
  const isAuthenticated = computed(() => !!token.value && !!usuario.value)
  const nombreCompleto = computed(() => usuario.value?.nombre ?? '')
  const rol = computed(() => usuario.value?.rol ?? null)
  const permisos = computed(() => usuario.value?.permisos ?? [])

  const esAdmin = computed(() => rol.value === 'ADMINISTRADOR')
  const esMedico = computed(() => rol.value === 'MEDICO')
  const esEnfermero = computed(() => rol.value === 'ENFERMERO')
  const esRecepcionista = computed(() => rol.value === 'RECEPCIONISTA')
  const esPaciente = computed(() => rol.value === 'PACIENTE')

  const tienePermiso = computed(() => (permiso: Permiso) => esAdmin.value || permisos.value.includes(permiso))
  const tieneCualquierPermiso = computed(() => (permisosRequeridos: Permiso[]) =>
    esAdmin.value || permisosRequeridos.some((p) => permisos.value.includes(p)),
  )
  const tieneTodosLosPermisos = computed(() => (permisosRequeridos: Permiso[]) =>
    esAdmin.value || permisosRequeridos.every((p) => permisos.value.includes(p)),
  )

  // --- ACTIONS ---
  async function initAuth() {
    const storedToken = localStorage.getItem('his_token')
    const storedUsuario = localStorage.getItem('his_usuario')

    if (storedToken && storedUsuario) {
      token.value = storedToken
      try {
        usuario.value = JSON.parse(storedUsuario)
        // Verificar que el token siga válido llamando a /auth/me
        await validarToken()
      } catch {
        // Token inválido, limpiar
        await logout()
      }
    }
  }

  async function validarToken() {
    if (!token.value) return false
    try {
      const userData = await authApi.me()
      usuario.value = userData
      localStorage.setItem('his_usuario', JSON.stringify(userData))
      return true
    } catch {
      await logout()
      return false
    }
  }

  async function login(email: string, password: string) {
    cargando.value = true
    error.value = null
    try {
      const response = await authApi.login({ email, password })
      token.value = response.token
      usuario.value = response.usuario
      localStorage.setItem('his_token', response.token)
      localStorage.setItem('his_usuario', JSON.stringify(response.usuario))
      return response.usuario
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al iniciar sesión'
      error.value = mensaje
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function logout() {
    token.value = null
    usuario.value = null
    localStorage.removeItem('his_token')
    localStorage.removeItem('his_usuario')
  }

  async function cargarUsuariosSistema() {
    cargando.value = true
    error.value = null
    try {
      usuariosSistema.value = await authApi.listarUsuarios()
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar usuarios'
      error.value = mensaje
      throw err
    } finally {
      cargando.value = false
    }
  }

  function setError(msg: string | null) {
    error.value = msg
  }

  function clearError() {
    error.value = null
  }

  // Verificación de permisos por nombre de rol (útil para UI condicional)
  function tieneRol(...roles: NombreRol[]) {
    return rol.value !== null && roles.includes(rol.value)
  }

  return {
    // State
    token,
    usuario,
    usuariosSistema,
    cargando,
    error,
    // Getters
    isAuthenticated,
    nombreCompleto,
    rol,
    permisos,
    tienePermiso,
    tieneCualquierPermiso,
    tieneTodosLosPermisos,
    esAdmin,
    esMedico,
    esEnfermero,
    esRecepcionista,
    esPaciente,
    // Actions
    initAuth,
    validarToken,
    login,
    logout,
    cargarUsuariosSistema,
    setError,
    clearError,
    tieneRol,
  }
}, {
  // Persistencia automática del token y usuario
  persist: {
    key: 'his_auth',
    pick: ['token', 'usuario'],
    storage: localStorage,
  },
})