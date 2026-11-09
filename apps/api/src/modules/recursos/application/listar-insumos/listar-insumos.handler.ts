import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import type { InsumoRepository } from '../../domain';
import { mapearInsumoADto, type InsumoDto } from '../insumo.dto';
import { INSUMO_REPOSITORY } from '../ports/tokens';
import type { ListarInsumosQuery } from './listar-insumos.query';

@Injectable()
export class ListarInsumosHandler
  implements CasoDeUso<ListarInsumosQuery, InsumoDto[]>
{
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
  ) {}

  async ejecutar(query: ListarInsumosQuery): Promise<InsumoDto[]> {
    const lista = await this.insumos.listar({ bajoMinimo: query.bajoMinimo });
    return lista.map(mapearInsumoADto);
  }
}
