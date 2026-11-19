import type { DirectorioDePacientes } from '../domain/directorio-de-pacientes';

/** Fake para tests: un mapa usuarioId → pacienteId. */
export class DirectorioDePacientesEnMemoria implements DirectorioDePacientes {
  private readonly vinculos = new Map<string, string>();

  vincular(usuarioId: string, pacienteId: string): void {
    this.vinculos.set(usuarioId, pacienteId);
  }

  pacienteIdDelUsuario(usuarioId: string): Promise<string | null> {
    return Promise.resolve(this.vinculos.get(usuarioId) ?? null);
  }
}
