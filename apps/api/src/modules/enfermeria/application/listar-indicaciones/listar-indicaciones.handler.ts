import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  INDICACION_REPOSITORY,
  type IndicacionRepository,
} from '../../domain/indicacion.repository';
import {
  mapearIndicacionADto,
  type IndicacionDto,
} from '../dtos/indicacion.dto';
import { ListarIndicacionesQuery } from './listar-indicaciones.query';

@Injectable()
export class ListarIndicacionesHandler
  implements CasoDeUso<ListarIndicacionesQuery, IndicacionDto[]>
{
  constructor(
    @Inject(INDICACION_REPOSITORY)
    private readonly repository: IndicacionRepository,
  ) {}

  async ejecutar(query: ListarIndicacionesQuery = new ListarIndicacionesQuery()): Promise<IndicacionDto[]> {
    const indicaciones = await this.repository.listar(query.filtros);
    return indicaciones.map(mapearIndicacionADto);
  }
}

