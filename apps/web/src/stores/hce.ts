/**
 * Store de HCE - Historia Clínica Electrónica (Pinia)
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hceApi } from '@/services/api'
import type {
  HistoriaClinicaDTO,
  CrearEvolucionRequest,
  CrearAlergiaRequest,
  CrearAntecedenteRequest,
  CrearPrescripcionRequest,
  CrearEstudioRequest,
} from '@/types/api'

export const useHceStore = defineStore('hce', () => {
  // --- STATE ---
  const historiaActual = ref<HistoriaClinicaDTO | null>(null)
  const cargando = ref(false)
  const error = ref<string | null>(null)

  // --- GETTERS ---
  const evoluciones = computed(() => historiaActual.value?.evoluciones ?? [])
  const alergias = computed(() => historiaActual.value?.alergias ?? [])
  const antecedentes = computed(() => historiaActual.value?.antecedentes ?? [])
  const prescripciones = computed(() => historiaActual.value?.prescripciones ?? [])
  const estudios = computed(() => historiaActual.value?.estudios ?? [])

  const prescripcionesActivas = computed(() =>
    prescripciones.value.filter((p) => p.estado === 'ACTIVA'),
  )

  const hayAlergiasGraves = computed(() =>
    alergias.value.some((a) => a.severidad === 'GRAVE'),
  )

  // Timeline combinado y ordenado por fecha
  const timeline = computed(() => {
    const items: Array<{ tipo: string; fecha: string; data: unknown; titulo: string }> = []

    evoluciones.value.forEach((e) => {
      items.push({
        tipo: 'evolucion',
        fecha: e.registradoEn,
        data: e,
        titulo: `Evolución - ${e.diagnostico}`,
      })
    })

    alergias.value.forEach((a) => {
      items.push({
        tipo: 'alergia',
        fecha: a.registradoEn,
        data: a,
        titulo: `Alergia: ${a.sustancia} (${a.severidad})`,
      })
    })

    antecedentes.value.forEach((ant) => {
      items.push({
        tipo: 'antecedente',
        fecha: ant.registradoEn,
        data: ant,
        titulo: `Antecedente: ${ant.parentesco} - ${ant.condicion}`,
      })
    })

    prescripciones.value.forEach((p) => {
      items.push({
        tipo: 'prescripcion',
        fecha: p.createdAt,
        data: p,
        titulo: `Prescripción: ${p.medicamento} ${p.dosis}`,
      })
    })

    estudios.value.forEach((e) => {
      items.push({
        tipo: 'estudio',
        fecha: e.createdAt,
        data: e,
        titulo: `Estudio: ${e.tipo} - ${e.descripcion}`,
      })
    })

    return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  })

  // --- ACTIONS ---
  async function cargarHistoria(pacienteId: string) {
    cargando.value = true
    error.value = null
    try {
      historiaActual.value = await hceApi.obtenerHistoria(pacienteId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar historia clínica'
      throw err
    } finally {
      cargando.value = false
    }
  }

  function limpiarHistoria() {
    historiaActual.value = null
  }

  async function crearEvolucion(data: CrearEvolucionRequest) {
    cargando.value = true
    error.value = null
    try {
      const nueva = await hceApi.crearEvolucion(data)
      if (historiaActual.value) {
        historiaActual.value.evoluciones.unshift(nueva)
      }
      return nueva
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear evolución'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function crearAlergia(data: CrearAlergiaRequest) {
    cargando.value = true
    error.value = null
    try {
      const nueva = await hceApi.crearAlergia(data)
      if (historiaActual.value) {
        historiaActual.value.alergias.unshift(nueva)
      }
      return nueva
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar alergia'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function crearAntecedente(data: CrearAntecedenteRequest) {
    cargando.value = true
    error.value = null
    try {
      const nuevo = await hceApi.crearAntecedente(data)
      if (historiaActual.value) {
        historiaActual.value.antecedentes.unshift(nuevo)
      }
      return nuevo
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar antecedente'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function crearPrescripcion(data: CrearPrescripcionRequest) {
    cargando.value = true
    error.value = null
    try {
      const nueva = await hceApi.crearPrescripcion(data)
      if (historiaActual.value) {
        historiaActual.value.prescripciones.unshift(nueva)
      }
      return nueva
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear prescripción'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function crearEstudio(data: CrearEstudioRequest) {
    cargando.value = true
    error.value = null
    try {
      const nuevo = await hceApi.crearEstudio(data)
      if (historiaActual.value) {
        historiaActual.value.estudios.unshift(nuevo)
      }
      return nuevo
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar estudio'
      throw err
    } finally {
      cargando.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  // Helpers para validaciones en UI
  function verificarAlergia(medicamento: string): boolean {
    return alergias.value.some(
      (a) => a.sustancia.toLowerCase().includes(medicamento.toLowerCase()),
    )
  }

  return {
    // State
    historiaActual,
    cargando,
    error,
    // Getters
    evoluciones,
    alergias,
    antecedentes,
    prescripciones,
    estudios,
    prescripcionesActivas,
    hayAlergiasGraves,
    timeline,
    // Actions
    cargarHistoria,
    limpiarHistoria,
    crearEvolucion,
    crearAlergia,
    crearAntecedente,
    crearPrescripcion,
    crearEstudio,
    clearError,
    verificarAlergia,
  }
})