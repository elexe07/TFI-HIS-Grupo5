import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { TURNO_REPOSITORY, type TurnoRepository } from '../../domain/turno.repository';
import { aTurnoDto, type TurnoDto } from '../turno.dto';
import type { ListarTurnosQuery } from './listar-turnos.query';

/** Lista turnos con filtros. Si pide un paciente, solo ve los suyos (ignora el pacienteId pedido). */
@Injectable()
export class ListarTurnosHandler implements CasoDeUso<ListarTurnosQuery, TurnoDto[]> {
  constructor(
    @Inject(TURNO_REPOSITORY) private readonly turnos: TurnoRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
  ) {}

  async ejecutar(query: ListarTurnosQuery): Promise<TurnoDto[]> {
    let pacienteId = query.pacienteId;
    if (query.solicitante?.esPaciente) {
      const propio = await this.pacientes.buscarPorUsuarioId(query.solicitante.usuarioId);
      if (!propio) return [];
      pacienteId = propio.id;
    }

    const lista = await this.turnos.listar({
      pacienteId,
      medicoId: query.medicoId,
      desde: query.desde,
      hasta: query.hasta,
    });
    return lista.map(aTurnoDto);
  }
}
