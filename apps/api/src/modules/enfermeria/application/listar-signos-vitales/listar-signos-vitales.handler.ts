import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  SIGNOS_VITALES_REPOSITORY,
  type SignosVitalesRepository,
} from '../../domain/signos-vitales.repository';
import {
  mapearSignosVitalesADto,
  type SignosVitalesDto,
} from '../dtos/signos-vitales.dto';

export class ListarSignosVitalesQuery {
  constructor(
    readonly filtros: {
      pacienteId?: string;
      internacionId?: string;
    },
  ) {}
}

@Injectable()
export class ListarSignosVitalesHandler
  implements CasoDeUso<ListarSignosVitalesQuery, SignosVitalesDto[]>
{
  constructor(
    @Inject(SIGNOS_VITALES_REPOSITORY)
    private readonly repository: SignosVitalesRepository,
  ) {}

  async ejecutar(query: ListarSignosVitalesQuery): Promise<SignosVitalesDto[]> {
    const listado = await this.repository.listar(query.filtros);
    return listado.map(mapearSignosVitalesADto);
  }
}

