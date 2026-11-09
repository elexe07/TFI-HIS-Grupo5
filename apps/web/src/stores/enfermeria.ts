/**
 * Store de Enfermería (Pinia)
 * Indicaciones, Signos Vitales, Administración de Medicación, Notas
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { enfermeriaApi } from '@/services/api';
import type {
  IndicacionDTO,
  GenerarIndicacionesRequest,
  GenerarIndicacionesResponse,
  SignosVitalesDTO,
  RegistrarSignosVitalesRequest,
  NotaEnfermeriaDTO,
  RegistrarNotaEnfermeriaRequest,
  EstadoIndicacion,
} from '@/types/api';

export const useEnfermeriaStore = defineStore('enfermeria', () => {
  // --- STATE ---
  const indicaciones = ref<IndicacionDTO[]>([]);
  const signosVitales = ref<SignosVitalesDTO[]>([]);
  const notas = ref<NotaEnfermeriaDTO[]>([]);
  const pacienteContextoId = ref<string | null>(null);
  const internacionContextoId = ref<string | null>(null);

  const cargando = ref(false);
  const error = ref<string | null>(null);

  // --- GETTERS ---
  const indicacionesPendientes = computed(() =>
    indicaciones.value.filter((i) => i.estado === 'PENDIENTE'),
  );

  const indicacionesEjecutadas = computed(() =>
    indicaciones.value.filter((i) => i.estado === 'EJECUTADA'),
  );

  const indicacionesOmitidas = computed(() =>
    indicaciones.value.filter((i) => i.estado === 'OMITIDA'),
  );

  const indicacionesPorEstado = computed(
    () => (estado: EstadoIndicacion) => indicaciones.value.filter((i) => i.estado === estado),
  );

  const proximasIndicaciones = computed(() => {
    const ahora = new Date();
    return indicacionesPendientes.value
      .filter((i) => new Date(i.programadaPara) >= ahora)
      .sort((a, b) => new Date(a.programadaPara).getTime() - new Date(b.programadaPara).getTime())
      .slice(0, 10);
  });

  const indicacionesVencidas = computed(() => {
    const ahora = new Date();
    return indicacionesPendientes.value
      .filter((i) => new Date(i.programadaPara) < ahora)
      .sort((a, b) => new Date(a.programadaPara).getTime() - new Date(b.programadaPara).getTime());
  });

  const ultimosSignosVitales = computed(() =>
    [...signosVitales.value].sort(
      (a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime(),
    ),
  );

  const signosVitalesHoy = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return signosVitales.value.filter((s) => new Date(s.registradoEn) >= hoy);
  });

  const ultimasNotas = computed(() =>
    [...notas.value].sort(
      (a, b) => new Date(b.registradoEn).getTime() - new Date(a.registradoEn).getTime(),
    ),
  );

  // Alertas de signos vitales fuera de rango
  const alertasSignosVitales = computed(() => {
    const alertas: Array<{
      signo: SignosVitalesDTO;
      parametro: string;
      valor: number;
      mensaje: string;
    }> = [];
    const ultimo = ultimosSignosVitales.value[0];
    if (!ultimo) return alertas;

    if (ultimo.temperatura !== null && (ultimo.temperatura < 35 || ultimo.temperatura > 38.5)) {
      alertas.push({
        signo: ultimo,
        parametro: 'Temperatura',
        valor: ultimo.temperatura,
        mensaje: ultimo.temperatura > 38.5 ? 'Fiebre alta' : 'Hipotermia',
      });
    }
    if (
      ultimo.presionSistolica !== null &&
      (ultimo.presionSistolica < 90 || ultimo.presionSistolica > 140)
    ) {
      alertas.push({
        signo: ultimo,
        parametro: 'Presión Sistólica',
        valor: ultimo.presionSistolica,
        mensaje: ultimo.presionSistolica > 140 ? 'Hipertensión' : 'Hipotensión',
      });
    }
    if (
      ultimo.frecuenciaCardiaca !== null &&
      (ultimo.frecuenciaCardiaca < 50 || ultimo.frecuenciaCardiaca > 110)
    ) {
      alertas.push({
        signo: ultimo,
        parametro: 'Frecuencia Cardíaca',
        valor: ultimo.frecuenciaCardiaca,
        mensaje: ultimo.frecuenciaCardiaca > 110 ? 'Taquicardia' : 'Bradicardia',
      });
    }
    if (ultimo.saturacionO2 !== null && ultimo.saturacionO2 < 95) {
      alertas.push({
        signo: ultimo,
        parametro: 'SpO₂',
        valor: ultimo.saturacionO2,
        mensaje: 'Hipoxemia',
      });
    }
    return alertas;
  });

  // --- ACTIONS ---
  function setContexto(pacienteId: string, internacionId?: string) {
    pacienteContextoId.value = pacienteId;
    internacionContextoId.value = internacionId ?? null;
  }

  async function cargarDatos() {
    if (!pacienteContextoId.value) return;
    cargando.value = true;
    error.value = null;
    try {
      const [inds, svs, nts] = await Promise.all([
        enfermeriaApi.listarIndicaciones({ pacienteId: pacienteContextoId.value }),
        enfermeriaApi.listarSignosVitales({ pacienteId: pacienteContextoId.value }),
        enfermeriaApi.listarNotas({ pacienteId: pacienteContextoId.value }),
      ]);
      indicaciones.value = inds;
      signosVitales.value = svs;
      notas.value = nts;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar datos de enfermería';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function generarIndicaciones(data: GenerarIndicacionesRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const response: GenerarIndicacionesResponse = await enfermeriaApi.generarIndicaciones(data);
      await cargarDatos();
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al generar indicaciones';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function administrarIndicacion(id: string) {
    cargando.value = true;
    error.value = null;
    try {
      const admin = await enfermeriaApi.administrarIndicacion(id);
      // Actualizar estado local
      const idx = indicaciones.value.findIndex((i) => i.id === id);
      if (idx !== -1) {
        const indicacion = indicaciones.value[idx];
        if (indicacion) {
          indicacion.estado = 'EJECUTADA';
        }
      }
      return admin;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al administrar medicación';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function omitirIndicacion(id: string, motivo: string) {
    cargando.value = true;
    error.value = null;
    try {
      const indicacion = await enfermeriaApi.omitirIndicacion(id, motivo);
      const idx = indicaciones.value.findIndex((i) => i.id === id);
      if (idx !== -1) {
        indicaciones.value[idx] = indicacion;
      }
      return indicacion;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al omitir indicación';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function registrarSignosVitales(data: RegistrarSignosVitalesRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const signos = await enfermeriaApi.registrarSignosVitales(data);
      signosVitales.value.unshift(signos);
      return signos;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al registrar signos vitales';
      throw err;
    } finally {
      cargando.value = false;
    }
  }

  async function crearNota(data: RegistrarNotaEnfermeriaRequest) {
    cargando.value = true;
    error.value = null;
    try {
      const nota = await enfermeriaApi.crearNota(data);
      notas.value.unshift(nota);
      return nota;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al guardar nota';
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
    indicaciones,
    signosVitales,
    notas,
    pacienteContextoId,
    internacionContextoId,
    cargando,
    error,
    // Getters
    indicacionesPendientes,
    indicacionesEjecutadas,
    indicacionesOmitidas,
    indicacionesPorEstado,
    proximasIndicaciones,
    indicacionesVencidas,
    ultimosSignosVitales,
    signosVitalesHoy,
    ultimasNotas,
    alertasSignosVitales,
    // Actions
    setContexto,
    cargarDatos,
    generarIndicaciones,
    administrarIndicacion,
    omitirIndicacion,
    registrarSignosVitales,
    crearNota,
    clearError,
  };
});
