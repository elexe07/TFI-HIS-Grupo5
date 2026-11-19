import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import type { ConceptoCargo } from '../../domain/enums';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../../domain/tarifa.repository';

export interface TarifaDto {
  id: string;
  concepto: ConceptoCargo;
  monto: number;
}

@Injectable()
export class ListarTarifasHandler implements CasoDeUso<void, TarifaDto[]> {
  constructor(
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifas: TarifaRepository,
  ) {}

  async ejecutar(): Promise<TarifaDto[]> {
    const lista = await this.tarifas.listarTodas();
    return lista.map((t) => ({ id: t.id, concepto: t.concepto, monto: t.monto }));
  }
}
