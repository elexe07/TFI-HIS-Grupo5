/**
 * Store de Facturación (Pinia)
 * Cuentas, Cobertura, Reportes
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { facturacionApi } from '@/services/api'
import type {
  CuentaDTO,
  ValidarCoberturaRequest,
  ValidarCoberturaResponse,
  ReporteFacturacionDTO,
  ReporteOcupacionDTO,
  ObraSocialDTO,
  TarifaDTO,
  ConceptoCargo,
  TipoCuenta,
  EstadoCuenta,
} from '@/types/api'

export const useFacturacionStore = defineStore('facturacion', () => {
  // --- STATE ---
  const cuentas = ref<CuentaDTO[]>([])
  const cuentaSeleccionada = ref<CuentaDTO | null>(null)
  const obrasSociales = ref<ObraSocialDTO[]>([])
  const tarifas = ref<TarifaDTO[]>([])

  const reporteFacturacion = ref<ReporteFacturacionDTO | null>(null)
  const reporteOcupacion = ref<ReporteOcupacionDTO | null>(null)

  const cargando = ref(false)
  const error = ref<string | null>(null)

  // --- GETTERS ---
  const cuentasAbiertas = computed(() =>
    cuentas.value.filter((c) => c.estado === 'ABIERTA'),
  )

  const cuentasCerradas = computed(() =>
    cuentas.value.filter((c) => c.estado === 'CERRADA'),
  )

  const cuentasPorTipo = computed(() => (tipo: TipoCuenta) =>
    cuentas.value.filter((c) => c.tipo === tipo),
  )

  const totalFacturado = computed(() =>
    cuentas.value.reduce((sum, c) => sum + c.total, 0),
  )

  const tarifasPorConcepto = computed(() => (concepto: ConceptoCargo) =>
    tarifas.value.find((t) => t.concepto === concepto)?.monto ?? 0,
  )

  // --- ACTIONS ---
  async function cargarCuentas(params?: { pacienteId?: string }) {
    cargando.value = true
    error.value = null
    try {
      cuentas.value = await facturacionApi.listarCuentas(params)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar cuentas'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function obtenerCuenta(id: string) {
    cargando.value = true
    error.value = null
    try {
      cuentaSeleccionada.value = await facturacionApi.obtenerCuenta(id)
      return cuentaSeleccionada.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener cuenta'
      throw err
    } finally {
      cargando.value = false
    }
  }

  function limpiarCuentaSeleccionada() {
    cuentaSeleccionada.value = null
  }

  async function validarCobertura(data: ValidarCoberturaRequest): Promise<ValidarCoberturaResponse> {
    cargando.value = true
    error.value = null
    try {
      return await facturacionApi.validarCobertura(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al validar cobertura'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function generarReporteFacturacion(desde: string, hasta: string) {
    cargando.value = true
    error.value = null
    try {
      reporteFacturacion.value = await facturacionApi.reporteFacturacion(desde, hasta)
      return reporteFacturacion.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al generar reporte de facturación'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function generarReporteOcupacion() {
    cargando.value = true
    error.value = null
    try {
      reporteOcupacion.value = await facturacionApi.reporteOcupacion()
      return reporteOcupacion.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al generar reporte de ocupación'
      throw err
    } finally {
      cargando.value = false
    }
  }

  async function cargarObrasSociales() {
    try {
      obrasSociales.value = await facturacionApi.listarObrasSociales()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar obras sociales'
      throw err
    }
  }

  async function cargarTarifas() {
    try {
      tarifas.value = await facturacionApi.listarTarifas()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar tarifas'
      throw err
    }
  }

  async function registrarPago(cuentaId: string, data: { monto: number; metodoPago: string; observaciones?: string }) {
    cargando.value = true
    error.value = null
    try {
      return await facturacionApi.registrarPago(cuentaId, data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar pago'
      throw err
    } finally {
      cargando.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  // Helpers para formateo
  function formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(monto)
  }

  function getConceptoLabel(concepto: ConceptoCargo): string {
    const labels: Record<ConceptoCargo, string> = {
      CONSULTA: 'Consulta Médica',
      MEDICACION: 'Medicación',
      DIA_CAMA: 'Día Cama',
    }
    return labels[concepto] ?? concepto
  }

  function getTipoCuentaLabel(tipo: TipoCuenta): string {
    return tipo === 'CONSULTA' ? 'Consulta' : 'Internación'
  }

  function getEstadoCuentaLabel(estado: EstadoCuenta): string {
    return estado === 'ABIERTA' ? 'Abierta' : 'Cerrada'
  }

  return {
    // State
    cuentas,
    cuentaSeleccionada,
    obrasSociales,
    tarifas,
    reporteFacturacion,
    reporteOcupacion,
    cargando,
    error,
    // Getters
    cuentasAbiertas,
    cuentasCerradas,
    cuentasPorTipo,
    totalFacturado,
    tarifasPorConcepto,
    // Actions
    cargarCuentas,
    obtenerCuenta,
    limpiarCuentaSeleccionada,
    validarCobertura,
    generarReporteFacturacion,
    generarReporteOcupacion,
    cargarObrasSociales,
    cargarTarifas,
    registrarPago,
    clearError,
    // Helpers
    formatearMonto,
    getConceptoLabel,
    getTipoCuentaLabel,
    getEstadoCuentaLabel,
  }
})