/**
 * Tipos del módulo Recursos: habitaciones, camas, internaciones e insumos.
 */
import type { PacienteDTO, MedicoDTO } from '@/modules/admision/admision.types';

export type EstadoCama = 'LIBRE' | 'OCUPADA' | 'EN_LIMPIEZA' | 'BLOQUEADA';
export type EstadoInternacion = 'ACTIVA' | 'ALTA';

export interface HabitacionDTO {
  id: string;
  sector: string;
  numero: string;
  camas: CamaDTO[];
}

/**
 * Cama del mapa. El backend la manda adentro de su habitación; `habitacion` la completa el store
 * al cargar el mapa para poder mostrar "Sector - Nro / Código" en listas sueltas.
 */
export interface CamaDTO {
  id: string;
  codigo: string;
  estado: EstadoCama;
  habitacionId?: string;
  updatedAt?: string;
  habitacion?: Pick<HabitacionDTO, 'id' | 'sector' | 'numero'>;
  internacionActiva?: InternacionDTO | null;
}

/** Respuesta de `GET /camas/mapa` (backend: application/obtener-mapa-camas/mapa-camas.dto.ts). */
export interface MapaCamasResponse {
  habitaciones: HabitacionDTO[];
  totales: {
    total: number;
    libre: number;
    ocupada: number;
    enLimpieza: number;
    bloqueada: number;
  };
}

/** Contadores que muestra el mapa de camas. */
export interface ResumenCamas {
  total: number;
  libres: number;
  ocupadas: number;
  enLimpieza: number;
  bloqueadas: number;
}

export interface CambiarEstadoCamaRequest {
  estado: EstadoCama;
}

export interface InternacionDTO {
  id: string;
  pacienteId: string;
  camaId: string;
  medicoId: string;
  motivo: string;
  estado: EstadoInternacion;
  ingresoEn: string;
  egresoEn: string | null;
  createdAt: string;
  updatedAt: string;
  paciente?: PacienteDTO;
  cama?: CamaDTO;
  medico?: MedicoDTO;
}

export interface InternarPacienteRequest {
  pacienteId: string;
  camaId: string;
  medicoId: string;
  motivo: string;
}

export interface AltaInternacionRequest {
  internacionId: string;
}

export interface InsumoDTO {
  id: string;
  codigo: string;
  nombre: string;
  medicamentoAsociado: string | null;
  stockActual: number;
  stockMinimo: number;
  updatedAt: string;
}

export interface IngresoInsumoRequest {
  cantidad: number;
}
