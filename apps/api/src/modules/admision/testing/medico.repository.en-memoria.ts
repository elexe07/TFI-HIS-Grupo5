import type { Medico } from '../domain/medico';
import type { MedicoRepository } from '../domain/medico.repository';

export class MedicoRepositoryEnMemoria implements MedicoRepository {
  private readonly medicos = new Map<string, Medico>();

  guardar(medico: Medico): Promise<void> {
    this.medicos.set(medico.id, medico);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Medico | null> {
    return Promise.resolve(this.medicos.get(id) ?? null);
  }

  buscarPorUsuarioId(usuarioId: string): Promise<Medico | null> {
    const encontrado = [...this.medicos.values()].find((m) => m.usuarioId === usuarioId);
    return Promise.resolve(encontrado ?? null);
  }

  buscarPorMatricula(matricula: string): Promise<Medico | null> {
    const encontrado = [...this.medicos.values()].find(
      (m) => m.matricula.toLowerCase() === matricula.trim().toLowerCase(),
    );
    return Promise.resolve(encontrado ?? null);
  }

  listar(): Promise<Medico[]> {
    return Promise.resolve([...this.medicos.values()]);
  }
}
