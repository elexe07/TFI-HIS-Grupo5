import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { AgendaMedico } from '../../domain/agenda';
import { AGENDA_REPOSITORY, type AgendaRepository } from '../../domain/agenda.repository';
import { MedicoNoEncontrado } from '../../domain/errores';
import { MEDICO_REPOSITORY, type MedicoRepository } from '../../domain/medico.repository';
import { aAgendaDto, type AgendaDto } from '../agenda.dto';
import type { DefinirAgendaCommand } from './definir-agenda.command';

/** ADM-03. Definir agenda del médico. Valida que las franjas del mismo día no se solapen. */
@Injectable()
export class DefinirAgendaHandler implements CasoDeUso<DefinirAgendaCommand, AgendaDto> {
  constructor(
    @Inject(AGENDA_REPOSITORY) private readonly agendas: AgendaRepository,
    @Inject(MEDICO_REPOSITORY) private readonly medicos: MedicoRepository,
  ) {}

  async ejecutar(command: DefinirAgendaCommand): Promise<AgendaDto> {
    const medico = await this.medicos.buscarPorId(command.medicoId);
    if (!medico) {
      throw new MedicoNoEncontrado(command.medicoId);
    }

    const agenda = AgendaMedico.crear(command.medicoId, command.franjas);
    await this.agendas.guardar(agenda);

    return aAgendaDto(agenda);
  }
}
