import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import { TRIAJE_REPOSITORY, type TriajeRepository } from '../../domain/triaje.repository';
import { aTriajeDto, type TriajeDto } from '../triaje.dto';
import type { AtenderTriajeCommand } from './atender-triaje.command';

@Injectable()
export class AtenderTriajeHandler implements CasoDeUso<AtenderTriajeCommand, TriajeDto> {
  constructor(@Inject(TRIAJE_REPOSITORY) private readonly triajes: TriajeRepository) {}

  async ejecutar(command: AtenderTriajeCommand): Promise<TriajeDto> {
    const triaje = await this.triajes.buscarPorId(command.triajeId);
    if (!triaje) {
      throw new NotFoundException(`Triaje ${command.triajeId} no encontrado`);
    }

    triaje.marcarAtendido();
    await this.triajes.guardar(triaje);

    return aTriajeDto(triaje);
  }
}
