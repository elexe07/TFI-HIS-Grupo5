import { Injectable } from '@nestjs/common';
import type { HistoriaClinica } from '../domain/historia-clinica';
import type { HistoriaClinicaRepository } from '../domain/historia-clinica.repository';

@Injectable()
export class HistoriaClinicaRepositoryEnMemoria implements HistoriaClinicaRepository {
  private readonly items = new Map<string, HistoriaClinica>();

  guardar(historia: HistoriaClinica): Promise<void> {
    this.items.set(historia.id, historia);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<HistoriaClinica | null> {
    const historia = this.items.get(id) || null;
    return Promise.resolve(historia);
  }

  buscarPorPacienteId(pacienteId: string): Promise<HistoriaClinica | null> {
    for (const h of this.items.values()) {
      if (h.pacienteId === pacienteId) {
        return Promise.resolve(h);
      }
    }
    return Promise.resolve(null);
  }

  buscarPorOrigenEventoId(origenEventoId: string): Promise<HistoriaClinica | null> {
    for (const h of this.items.values()) {
      if (h.origenEventoId === origenEventoId) {
        return Promise.resolve(h);
      }
    }
    return Promise.resolve(null);
  }
}
