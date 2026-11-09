import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { type InsumoRepository, InsumoNoEncontrado } from '../../domain';
import { mapearInsumoADto, type InsumoDto } from '../insumo.dto';
import { INSUMO_REPOSITORY } from '../ports/tokens';
import type { RegistrarEgresoInsumoCommand } from './registrar-egreso-insumo.command';

@Injectable()
export class RegistrarEgresoInsumoHandler implements CasoDeUso<
  RegistrarEgresoInsumoCommand,
  InsumoDto
> {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
  ) {}

  async ejecutar(command: RegistrarEgresoInsumoCommand): Promise<InsumoDto> {
    const insumo = await this.insumos.buscarPorId(command.insumoId);
    if (!insumo) {
      throw new InsumoNoEncontrado(command.insumoId);
    }

    insumo.descontar(command.cantidad);
    await this.insumos.guardar(insumo);

    return mapearInsumoADto(insumo);
  }
}
