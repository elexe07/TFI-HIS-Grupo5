/**
 * Store del portal del paciente (Pinia). Solo lectura: ficha, turnos y cuentas propias.
 */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { portalApi } from './portal.api';
import type { MedicoDTO, PacienteDTO, TurnoDTO } from '@/modules/admision/admision.types';
import type { CuentaDelPaciente } from './portal.types';

export const usePortalStore = defineStore('portal', () => {
  // --- STATE ---
  const paciente = ref<PacienteDTO | null>(null);
  /** true si el usuario no tiene ficha de paciente vinculada (la API responde 404). */
  const sinFichaVinculada = ref(false);
  const turnos = ref<TurnoDTO[]>([]);
  const medicos = ref<MedicoDTO[]>([]);
  const cuentas = ref<CuentaDelPaciente[]>([]);
  const cargando = ref(false);
  const error = ref<string | null>(null);

  // --- GETTERS ---
  /** Próximos turnos primero (el más cercano arriba); después los pasados, del más reciente al más viejo. */
  const turnosOrdenados = computed(() => {
    const ahora = Date.now();
    const inicio = (t: TurnoDTO) => new Date(t.inicio).getTime();
    const proximos = turnos.value.filter((t) => inicio(t) >= ahora);
    const pasados = turnos.value.filter((t) => inicio(t) < ahora);
    return [
      ...proximos.sort((a, b) => inicio(a) - inicio(b)),
      ...pasados.sort((a, b) => inicio(b) - inicio(a)),
    ];
  });

  const cuentasOrdenadas = computed(() =>
    [...cuentas.value].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );

  const medicoDe = computed(
    () => (medicoId: string) => medicos.value.find((m) => m.id === medicoId),
  );

  // --- ACTIONS ---
  async function cargar() {
    cargando.value = true;
    error.value = null;
    sinFichaVinculada.value = false;
    try {
      paciente.value = await portalApi.miPaciente();
    } catch (err) {
      paciente.value = null;
      if ((err as { status?: number }).status === 404) {
        sinFichaVinculada.value = true;
      } else {
        error.value = err instanceof Error ? err.message : 'No se pudo cargar tu ficha';
      }
      cargando.value = false;
      return;
    }
    try {
      [turnos.value, medicos.value, cuentas.value] = await Promise.all([
        portalApi.misTurnos(),
        portalApi.medicos(),
        portalApi.misCuentas(),
      ]);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'No se pudieron cargar tus datos';
    } finally {
      cargando.value = false;
    }
  }

  function detalleCuenta(id: string) {
    return portalApi.detalleCuenta(id);
  }

  return {
    paciente,
    sinFichaVinculada,
    turnos,
    medicos,
    cuentas,
    cargando,
    error,
    turnosOrdenados,
    cuentasOrdenadas,
    medicoDe,
    cargar,
    detalleCuenta,
  };
});
