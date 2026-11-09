import type { Id } from '../../../building-blocks/domain';
import type { FiltroInsumos, Insumo, InsumoRepository } from '../domain';

export class InsumoRepositoryEnMemoria implements InsumoRepository {
  private readonly insumos = new Map<Id, Insumo>();

  guardar(insumo: Insumo): Promise<void> {
    this.insumos.set(insumo.id, insumo);
    return Promise.resolve();
  }

  buscarPorId(id: Id): Promise<Insumo | null> {
    return Promise.resolve(this.insumos.get(id) ?? null);
  }

  buscarPorCodigo(codigo: string): Promise<Insumo | null> {
    const encontrado = [...this.insumos.values()].find((i) => i.codigo === codigo);
    return Promise.resolve(encontrado ?? null);
  }

  buscarPorMedicamentoAsociado(medicamento: string): Promise<Insumo | null> {
    const encontrado = [...this.insumos.values()].find(
      (i) => i.medicamentoAsociado?.toLowerCase() === medicamento.toLowerCase(),
    );
    return Promise.resolve(encontrado ?? null);
  }

  listar(filtro?: FiltroInsumos): Promise<Insumo[]> {
    let lista = [...this.insumos.values()];
    if (filtro?.bajoMinimo) {
      lista = lista.filter((i) => i.estaBajoMinimo());
    }
    return Promise.resolve(lista);
  }
}
