import type { Turno } from '../domain/turno';
import type { FiltrosListarTurnos, TurnoRepository } from '../domain/turno.repository';

function coincideFecha(t: Turno, desde?: Date, hasta?: Date): boolean {
  if (desde && t.inicio < desde) return false;
  if (hasta && t.inicio > hasta) return false;
  return true;
}

function coincideFiltro(t: Turno, filtros?: FiltrosListarTurnos): boolean {
  if (!filtros) return true;
  if (filtros.pacienteId && t.pacienteId !== filtros.pacienteId) return false;
  if (filtros.medicoId && t.medicoId !== filtros.medicoId) return false;
  return coincideFecha(t, filtros.desde, filtros.hasta);
}

export class TurnoRepositoryEnMemoria implements TurnoRepository {
  private readonly turnos = new Map<string, Turno>();

  guardar(turno: Turno): Promise<void> {
    this.turnos.set(turno.id, turno);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Turno | null> {
    return Promise.resolve(this.turnos.get(id) ?? null);
  }

  // eslint-disable-next-line max-params
  buscarSuperpuesto(
    medicoId: string,
    inicio: Date,
    fin: Date,
    excluirTurnoId?: string,
  ): Promise<Turno | null> {
    const encontrado = [...this.turnos.values()].find((t) => {
      if (t.id === excluirTurnoId) return false;
      if (t.medicoId !== medicoId) return false;
      if (!t.estaReservado) return false;
      return t.seSuperponeCon(inicio, fin);
    });
    return Promise.resolve(encontrado ?? null);
  }

  listar(filtros?: FiltrosListarTurnos): Promise<Turno[]> {
    const resultado = [...this.turnos.values()].filter((t) => coincideFiltro(t, filtros));
    resultado.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
    return Promise.resolve(resultado);
  }
}

