import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { type CamaRepository, CamaNoEncontrada } from '../../domain';
import { mapearCamaADto, type CamaDto } from '../cama.dto';
import { CAMA_REPOSITORY } from '../ports/tokens';
import type { CambiarEstadoCamaCommand } from './cambiar-estado-cama.command';

@Injectable()
export class CambiarEstadoCamaHandler implements CasoDeUso<CambiarEstadoCamaCommand, CamaDto> {
  constructor(
    @Inject(CAMA_REPOSITORY)
    private readonly camas: CamaRepository,
  ) {}

  async ejecutar(command: CambiarEstadoCamaCommand): Promise<CamaDto> {
    const cama = await this.camas.buscarPorId(command.camaId);
    if (!cama) {
      throw new CamaNoEncontrada(command.camaId);
    }

    cama.cambiarEstado(command.nuevoEstado);
    await this.camas.guardar(cama);

    return mapearCamaADto(cama);
  }
}
