import type { EstadoCama } from '../../domain';

export interface CamaMapaDto {
  id: string;
  codigo: string;
  estado: EstadoCama;
  internacionActiva?: {
    id: string;
    pacienteId: string;
    ingresoEn: string;
    medicoId: string;
  } | null;
}

export interface HabitacionMapaDto {
  id: string;
  sector: string;
  numero: string;
  camas: CamaMapaDto[];
}

export interface TotalesCamasDto {
  libre: number;
  ocupada: number;
  enLimpieza: number;
  bloqueada: number;
  total: number;
}

export interface MapaCamasDto {
  totales: TotalesCamasDto;
  habitaciones: HabitacionMapaDto[];
}
