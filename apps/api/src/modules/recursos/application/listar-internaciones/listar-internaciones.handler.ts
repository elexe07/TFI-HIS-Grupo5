import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { INTERNACION_REPOSITORY, type InternacionRepository } from '../../domain';
import { mapearInternacionADto, type InternacionDto } from '../internacion.dto';
import type { ListarInternacionesQuery } from './listar-internaciones.query';

@Injectable()
export class ListarInternacionesHandler implements CasoDeUso<
  ListarInternacionesQuery,
  InternacionDto[]
> {
  constructor(
    @Inject(INTERNACION_REPOSITORY)
    private readonly internaciones: InternacionRepository,
  ) {}

  async ejecutar(query: ListarInternacionesQuery): Promise<InternacionDto[]> {
    const lista = await this.internaciones.buscarTodas(
      query.estado ? { estado: query.estado } : undefined,
    );
    return lista.map(mapearInternacionADto);
  }
}
