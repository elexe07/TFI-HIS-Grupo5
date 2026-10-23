import type {
  FiltrosSignosVitales,
  SignosVitalesRepository,
} from '../domain/signos-vitales.repository';
import type { SignosVitales } from '../domain/signos-vitales';

export class SignosVitalesRepositoryEnMemoria implements SignosVitalesRepository {
  private readonly items: SignosVitales[] = [];

  async guardar(signosVitales: SignosVitales): Promise<void> {
    this.items.push(signosVitales);
  }

  async listar(filtros: FiltrosSignosVitales): Promise<SignosVitales[]> {
    let resultado = [...this.items];

    if (filtros.pacienteId) {
      resultado = resultado.filter((sv) => sv.pacienteId === filtros.pacienteId);
    }
    if (filtros.internacionId) {
      resultado = resultado.filter((sv) => sv.internacionId === filtros.internacionId);
    }

    return resultado.sort((a, b) => b.registradoEn.getTime() - a.registradoEn.getTime());
  }

  limpiar(): void {
    this.items.length = 0;
  }
}

