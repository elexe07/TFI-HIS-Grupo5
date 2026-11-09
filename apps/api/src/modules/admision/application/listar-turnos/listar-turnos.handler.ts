import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { TURNO_REPOSITORY, type TurnoRepository } from '../../domain/turno.repository';
import { aTurnoDto, type TurnoDto } from '../turno.dto';
import type { ListarTurnosQuery } from './listar-turnos.query';

@Injectable()
export class ListarTurnosHandler implements CasoDeUso<ListarTurnosQuery, TurnoDto[]> {
  constructor(@Inject(TURNO_REPOSITORY) private readonly turnos: TurnoRepository) {}

  async ejecutar(query: ListarTurnosQuery): Promise<TurnoDto[]> {
    const lista = await this.turnos.listar({
      pacienteId: query.pacienteId,
      medicoId: query.medicoId,
      desde: query.desde,
      hasta: query.hasta,
    });
    return lista.map(aTurnoDto);
  }
}
