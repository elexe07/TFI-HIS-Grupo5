/**
 * Store de Recursos y Camas (Pinia)
 * Mapa de camas, Internaciones, Insumos
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { recursosApi } from '@/services/api';
import type {
  HabitacionDTO,
  MapaCamasResponse,
  EstadoCama,
  InternacionDTO,
  EstadoInternacion,
  InsumoDTO,
  InternarPacienteRequest,
} from '@/types/api';

export const useRecursosStore = defineStore('recursos', () => {
  // --- STATE ---
  const habitaciones = ref<HabitacionDTO[]>([]);
  const internaciones = ref<InternacionDTO[]>([]);
  const insumos = ref<InsumoDTO[]>([]);
  const resumenCamas = ref<MapaCamasResponse['resumen']>({
    total: 0,
    libres: 0,
    ocupadas: 0,
    enLimpieza: 0,
    bloqueadas: 0,
  });

  const cargando = ref(false);
  const error = ref<string | null>(null);

  // --- GETTERS ---
  const camas = computed(() => habitaciones.value.flatMap((h) => h.camas));

  const camasPorEstado = computed(
    () => (estado: EstadoCama) => camas.value.filter((c) => c.estado === estado),
  );

  const camasLibres = computed(() => camasPorEstado.value('LIBRE'));
  const camasOcupadas = computed(() => camasPorEstado.value('OCUPADA'));
  const camasEnLimpieza = computed(() => camasPorEstado.value('EN_LIMPIEZA'));
  const camasBloqueadas = computed(() => camasPorEstado.value('BLOQUEADA'));

  const internacionesActivas = computed(() =>
    internaciones.value.filter((i) => i.estado === 'ACTIVA'),
  );

  const internacionesPorCama = computed(
    () => (camaId: string) =>
      internaciones.value.find((i) => i.camaId === camaId && i.estado === 'ACTIVA'),
  );

  const insumosBajoMinimo = computed(() =>
    insumos.value.filter((i) => i.stockActual <= i.stockMinimo),
  );

  const insumosConStock = computed(() => insumos.value.filter((i) => i.stockActual > 0));

  // Transiciones válidas de cama
  const transicionesValidas: Record<EstadoCama, EstadoCama[]> = {
    LIBRE: ['OCUPADA', 'BLOQUEADA'],
    OCUPADA: ['EN_LIMPIEZA'],
    EN_LIMPIEZA: ['LIBRE'],
    BLOQUEADA: ['LIBRE'],
  };

  function puedeCambiarEstado(estadoActual: EstadoCama, nuevoEstado: EstadoCama): boolean {
    return transicionesValidas[estadoActual]?.includes(nuevoEstado) ?? false;
  }

  // --- ACTIONS ---
  async function cargarMapaCamas() {
    cargando.value = true;
    error.value = null;
    try {
      const response = await recursosApi.obtenerMapaCamas();
      habitaciones.value = response.habitaciones;
      resumenCamas.value = response.resumen;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar mapa de camas';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cambiarEstadoCama(camaId: string, nuevoEstado: EstadoCama) {
    cargando.value = true;
    error.value = null;
    try {
      const camaActualizada = await recursosApi.cambiarEstadoCama(camaId, nuevoEstado);
      // Actualizar en el estado local
      for (const habitacion of habitaciones.value) {
        const idx = habitacion.camas.findIndex((c) => c.id === camaId);
        if (idx !== -1) {
          habitacion.camas[idx] = camaActualizada;
          break;
        }
      }
      // Recalcular resumen
      await recalcularResumen();
      return camaActualizada;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cambiar estado de cama';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function recalcularResumen() {
    const todasLasCamas = camas.value;
    resumenCamas.value = {
      total: todasLasCamas.length,
      libres: todasLasCamas.filter((c) => c.estado === 'LIBRE').length,
      ocupadas: todasLasCamas.filter((c) => c.estado === 'OCUPADA').length,
      enLimpieza: todasLasCamas.filter((c) => c.estado === 'EN_LIMPIEZA').length,
      bloqueadas: todasLasCamas.filter((c) => c.estado === 'BLOQUEADA').length,
    };
  }

  async function cargarInternaciones(params?: { estado?: EstadoInternacion }) {
    cargando.value = true;
    error.value = null;
    try {
      internaciones.value = await recursosApi.listarInternaciones(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar internaciones';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function internarPaciente(data: InternarPacienteRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const nueva = await recursosApi.internarPaciente(data);
      internaciones.value.push(nueva);
      // La cama se actualiza vía evento, pero forzamos recarga del mapa
      await cargarMapaCamas();
      return nueva;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al internar paciente';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function darAlta(internacionId: string) {
    cargando.value = true;
    error.value = null;
    try {
      await recursosApi.darAlta(internacionId);
      const idx = internaciones.value.findIndex((i) => i.id === internacionId);
      if (idx !== -1) {
        const internacion = internaciones.value[idx];
        if (internacion) {
          internacion.estado = 'ALTA';
          internacion.egresoEn = new Date().toISOString();
        }
      }
      await cargarMapaCamas();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al dar de alta';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function cargarInsumos(params?: { bajoMinimo?: boolean }) {
    cargando.value = true;
    error.value = null;
    try {
      insumos.value = await recursosApi.listarInsumos(params);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar insumos';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function ingresarInsumo(id: string, cantidad: number) {
    cargando.value = true;
    error.value = null;
    try {
      const actualizado = await recursosApi.ingresarInsumo(id, cantidad);
      const idx = insumos.value.findIndex((i) => i.id === id);
      if (idx !== -1) {
        insumos.value[idx] = actualizado;
      }
      return actualizado;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al ingresar insumo';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    habitaciones,
    internaciones,
    insumos,
    resumenCamas,
    cargando,
    error,
    // Getters
    camas,
    camasPorEstado,
    camasLibres,
    camasOcupadas,
    camasEnLimpieza,
    camasBloqueadas,
    internacionesActivas,
    internacionesPorCama,
    insumosBajoMinimo,
    insumosConStock,
    puedeCambiarEstado,
    // Actions
    cargarMapaCamas,
    cambiarEstadoCama,
    recalcularResumen,
    cargarInternaciones,
    internarPaciente,
    darAlta,
    cargarInsumos,
    ingresarInsumo,
    clearError,
  };
});
