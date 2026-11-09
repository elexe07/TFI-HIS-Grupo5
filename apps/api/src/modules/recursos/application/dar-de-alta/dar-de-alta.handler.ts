import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso, EventBus } from '../../../../building-blocks/application';
import { EVENT_BUS } from '../../../../building-blocks/application';
import {
  type CamaRepository,
  CamaNoEncontrada,
  InternacionNoEncontrada,
  type InternacionRepository,
} from '../../domain';
import { mapearInternacionADto, type InternacionDto } from '../internacion.dto';
import { CAMA_REPOSITORY, INTERNACION_REPOSITORY } from '../ports/tokens';
import type { DarDeAltaCommand } from './dar-de-alta.command';

@Injectable()
export class DarDeAltaHandler implements CasoDeUso<DarDeAltaCommand, InternacionDto> {
  constructor(
    @Inject(INTERNACION_REPOSITORY)
    private readonly internaciones: InternacionRepository,
    @Inject(CAMA_REPOSITORY)
    private readonly camas: CamaRepository,
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBus,
  ) {}

  async ejecutar(command: DarDeAltaCommand): Promise<InternacionDto> {
    const internacion = await this.internaciones.buscarPorId(command.internacionId);
    if (!internacion) {
      throw new InternacionNoEncontrada(command.internacionId);
    }

    const cama = await this.camas.buscarPorId(internacion.camaId);
    if (!cama) {
      throw new CamaNoEncontrada(internacion.camaId);
    }

    internacion.darDeAlta(command.egresoEn);
    cama.marcarEnLimpieza();

    await this.internaciones.guardar(internacion);
    await this.camas.guardar(cama);

    const eventos = internacion.extraerEventos();
    await this.eventBus.publicar(eventos);

    return mapearInternacionADto(internacion);
  }
}
