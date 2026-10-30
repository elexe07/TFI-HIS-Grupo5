import type {
  FiltrosListarIndicaciones,
  IndicacionRepository,
} from '../domain/indicacion.repository';
import type { Indicacion } from '../domain/indicacion';

export class IndicacionRepositoryEnMemoria implements IndicacionRepository {
  private readonly items = new Map<string, Indicacion>();

  async guardar(indicacion: Indicacion): Promise<void> {
    this.items.set(indicacion.id, indicacion);
  }

  async guardarMuchas(indicaciones: Indicacion[]): Promise<void> {
    for (const ind of indicaciones) {
      this.items.set(ind.id, ind);
    }
  }

  async buscarPorId(id: string): Promise<Indicacion | null> {
    return this.items.get(id) ?? null;
  }

  async buscarPorPrescripcionId(prescripcionId: string): Promise<Indicacion[]> {
    return Array.from(this.items.values()).filter((i) => i.prescripcionId === prescripcionId);
  }

  async listar(filtros?: FiltrosListarIndicaciones): Promise<Indicacion[]> {
    let resultado = Array.from(this.items.values());

    if (filtros?.internacionId) {
      resultado = resultado.filter((i) => i.internacionId === filtros.internacionId);
    }
    if (filtros?.pacienteId) {
      resultado = resultado.filter((i) => i.pacienteId === filtros.pacienteId);
    }
    if (filtros?.fecha) {
      const inicio = new Date(filtros.fecha);
      inicio.setUTCHours(0, 0, 0, 0);
      const fin = new Date(filtros.fecha);
      fin.setUTCHours(23, 59, 59, 999);

      resultado = resultado.filter(
        (i) => i.programadaPara >= inicio && i.programadaPara <= fin,
      );
    }

    return resultado.sort((a, b) => a.programadaPara.getTime() - b.programadaPara.getTime());
  }

  async existePorPrescripcionYFecha(prescripcionId: string, programadaPara: Date): Promise<boolean> {
    return Array.from(this.items.values()).some(
      (i) =>
        i.prescripcionId === prescripcionId &&
        i.programadaPara.getTime() === programadaPara.getTime(),
    );
  }

  limpiar(): void {
    this.items.clear();
  }
}

