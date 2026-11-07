import type { AgendaMedico, FranjaAgenda } from '../domain/agenda';

export interface FranjaAgendaDto {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
  duracionTurnoMin: number;
}

export interface AgendaDto {
  medicoId: string;
  franjas: FranjaAgendaDto[];
}

export function aFranjaAgendaDto(f: FranjaAgenda): FranjaAgendaDto {
  return {
    id: f.id,
    diaSemana: f.diaSemana,
    horaInicio: f.horaInicio,
    horaFin: f.horaFin,
    duracionTurnoMin: f.duracionTurnoMin,
  };
}

export function aAgendaDto(agenda: AgendaMedico): AgendaDto {
  return {
    medicoId: agenda.medicoId,
    franjas: agenda.obtenerFranjas().map(aFranjaAgendaDto),
  };
}
