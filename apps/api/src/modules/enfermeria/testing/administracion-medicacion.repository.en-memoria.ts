import type { AdministracionDeMedicacion } from '../domain/administracion-medicacion';
import type { AdministracionMedicacionRepository } from '../domain/administracion-medicacion.repository';

export class AdministracionMedicacionRepositoryEnMemoria
  implements AdministracionMedicacionRepository
{
  private readonly items = new Map<string, AdministracionDeMedicacion>();

  async guardar(administracion: AdministracionDeMedicacion): Promise<void> {
    this.items.set(administracion.id, administracion);
  }

  async buscarPorIndicacionId(indicacionId: string): Promise<AdministracionDeMedicacion | null> {
    return (
      Array.from(this.items.values()).find((a) => a.indicacionId === indicacionId) ?? null
    );
  }

  async listarPorPaciente(pacienteId: string): Promise<AdministracionDeMedicacion[]> {
    return Array.from(this.items.values())
      .filter((a) => a.pacienteId === pacienteId)
      .sort((a, b) => a.administradaEn.getTime() - b.administradaEn.getTime());
  }

  limpiar(): void {
    this.items.clear();
  }
}

