import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  NOTA_ENFERMERIA_REPOSITORY,
  type NotaEnfermeriaRepository,
} from '../../domain/nota-enfermeria.repository';
import {
  mapearNotaADto,
  type NotaEnfermeriaDto,
} from '../dtos/nota-enfermeria.dto';

export class ListarNotasEnfermeriaQuery {
  constructor(
    readonly filtros: {
      pacienteId?: string;
      internacionId?: string;
    },
  ) {}
}

@Injectable()
export class ListarNotasEnfermeriaHandler
  implements CasoDeUso<ListarNotasEnfermeriaQuery, NotaEnfermeriaDto[]>
{
  constructor(
    @Inject(NOTA_ENFERMERIA_REPOSITORY)
    private readonly repository: NotaEnfermeriaRepository,
  ) {}

  async ejecutar(query: ListarNotasEnfermeriaQuery): Promise<NotaEnfermeriaDto[]> {
    const listado = await this.repository.listar(query.filtros);
    return listado.map(mapearNotaADto);
  }
}

