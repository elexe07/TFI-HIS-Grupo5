import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { AgendaMedico } from '../../domain/agenda';
import { AGENDA_REPOSITORY, type AgendaRepository } from '../../domain/agenda.repository';
import { MedicoNoEncontrado } from '../../domain/errores';
import { MEDICO_REPOSITORY, type MedicoRepository } from '../../domain/medico.repository';
import { aAgendaDto, type AgendaDto } from '../agenda.dto';
import type { ObtenerAgendaQuery } from './obtener-agenda.query';

@Injectable()
export class ObtenerAgendaHandler implements CasoDeUso<ObtenerAgendaQuery, AgendaDto> {
  constructor(
    @Inject(AGENDA_REPOSITORY) private readonly agendas: AgendaRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: MedicoRepository,
  ) {}

  async ejecutar(query: ObtenerAgendaQuery): Promise<AgendaDto> {
    const medico = await this.medicos.buscarPorId(query.medicoId);
    if (!medico) {
      throw new MedicoNoEncontrado(query.medicoId);
    }

    const agenda =
      (await this.agendas.buscarPorMedicoId(query.medicoId)) ??
      AgendaMedico.crear(query.medicoId, []);

    return aAgendaDto(agenda);
  }
}
