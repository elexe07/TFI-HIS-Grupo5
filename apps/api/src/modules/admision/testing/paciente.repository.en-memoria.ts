import type { Paciente } from '../domain/paciente';
import type { FiltrosBuscarPaciente, PacienteRepository } from '../domain/paciente.repository';
import type { TipoDocumento } from '../domain/tipos';

export class PacienteRepositoryEnMemoria implements PacienteRepository {
  private readonly pacientes = new Map<string, Paciente>();

  guardar(paciente: Paciente): Promise<void> {
    this.pacientes.set(paciente.id, paciente);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Paciente | null> {
    return Promise.resolve(this.pacientes.get(id) ?? null);
  }

  buscarPorDocumento(tipo: TipoDocumento, numero: string): Promise<Paciente | null> {
    const encontrado = [...this.pacientes.values()].find(
      (p) => p.documento.tipo === tipo && p.documento.numero === numero,
    );
    return Promise.resolve(encontrado ?? null);
  }

  buscarPorUsuarioId(usuarioId: string): Promise<Paciente | null> {
    const encontrado = [...this.pacientes.values()].find((p) => p.usuarioId === usuarioId);
    return Promise.resolve(encontrado ?? null);
  }

  buscar(filtros: FiltrosBuscarPaciente): Promise<Paciente[]> {
    let resultado = [...this.pacientes.values()];
    if (filtros.documento) {
      const docTerm = filtros.documento.trim().toLowerCase();
      resultado = resultado.filter((p) => p.documento.numero.toLowerCase().includes(docTerm));
    }
    if (filtros.apellido) {
      const apTerm = filtros.apellido.trim().toLowerCase();
      resultado = resultado.filter((p) => p.apellido.toLowerCase().includes(apTerm));
    }
    return Promise.resolve(resultado);
  }
}
