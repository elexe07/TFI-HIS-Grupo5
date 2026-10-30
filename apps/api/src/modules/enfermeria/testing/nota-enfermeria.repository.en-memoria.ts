import type {
  FiltrosNotasEnfermeria,
  NotaEnfermeriaRepository,
} from '../domain/nota-enfermeria.repository';
import type { NotaDeEnfermeria } from '../domain/nota-enfermeria';

export class NotaEnfermeriaRepositoryEnMemoria implements NotaEnfermeriaRepository {
  private readonly items: NotaDeEnfermeria[] = [];

  async guardar(nota: NotaDeEnfermeria): Promise<void> {
    this.items.push(nota);
  }

  async listar(filtros: FiltrosNotasEnfermeria): Promise<NotaDeEnfermeria[]> {
    let resultado = [...this.items];

    if (filtros.pacienteId) {
      resultado = resultado.filter((n) => n.pacienteId === filtros.pacienteId);
    }
    if (filtros.internacionId) {
      resultado = resultado.filter((n) => n.internacionId === filtros.internacionId);
    }

    return resultado.sort((a, b) => b.registradoEn.getTime() - a.registradoEn.getTime());
  }

  limpiar(): void {
    this.items.length = 0;
  }
}

