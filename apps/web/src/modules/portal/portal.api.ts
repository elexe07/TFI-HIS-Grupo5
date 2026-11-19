/**
 * Endpoints que usa el portal del paciente. El backend filtra por el usuario logueado:
 * un PACIENTE solo recibe sus turnos y sus cuentas, aunque pida la lista completa.
 */
import { get } from '@/shared/http/client';
import type { MedicoDTO, PacienteDTO, TurnoDTO } from '@/modules/admision/admision.types';
import type { CuentaDelPaciente } from './portal.types';

export const portalApi = {
  miPaciente: () => get<PacienteDTO>('/pacientes/yo'),
  misTurnos: () => get<TurnoDTO[]>('/turnos'),
  medicos: () => get<MedicoDTO[]>('/medicos'),
  misCuentas: () => get<CuentaDelPaciente[]>('/cuentas'),
  detalleCuenta: (id: string) => get<CuentaDelPaciente>(`/cuentas/${id}`),
};
