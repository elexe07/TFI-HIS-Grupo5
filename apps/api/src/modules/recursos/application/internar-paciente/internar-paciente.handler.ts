import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso, EventBus } from '../../../../building-blocks/application';
import { EVENT_BUS } from '../../../../building-blocks/application';
import {
  type CamaRepository,
  CamaNoEncontrada,
  CamaNoLibre,
  EstadoCama,
  Internacion,
  type InternacionRepository,
  PacienteYaInternado,
} from '../../domain';
import { mapearInternacionADto, type InternacionDto } from '../internacion.dto';
import { CAMA_REPOSITORY, INTERNACION_REPOSITORY } from '../ports/tokens';
import type { InternarPacienteCommand } from './internar-paciente.command';

@Injectable()
export class InternarPacienteHandler implements CasoDeUso<InternarPacienteCommand, InternacionDto> {
  constructor(
    @Inject(CAMA_REPOSITORY)
    private readonly camas: CamaRepository,
    @Inject(INTERNACION_REPOSITORY)
    private readonly internaciones: InternacionRepository,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {}

  async ejecutar(command: InternarPacienteCommand): Promise<InternacionDto> {
    const cama = await this.camas.buscarPorId(command.camaId);
    if (!cama) {
      throw new CamaNoEncontrada(command.camaId);
    }

    if (cama.estado !== EstadoCama.LIBRE) {
      throw new CamaNoLibre(cama.id, cama.estado);
    }

    const internacionActivaPaciente = await this.internaciones.buscarActivaPorPacienteId(
      command.pacienteId,
    );
    if (internacionActivaPaciente) {
      throw new PacienteYaInternado(command.pacienteId);
    }

    const internacion = Internacion.crear({
      pacienteId: command.pacienteId,
      camaId: command.camaId,
      medicoId: command.medicoId,
      motivo: command.motivo,
      ingresoEn: command.ingresoEn,
    });

    cama.ocupar();

    await this.internaciones.guardar(internacion);
    await this.camas.guardar(cama);

    const eventos = internacion.extraerEventos();
    await this.eventBus.publicar(eventos);

    return mapearInternacionADto(internacion);
  }
}
