import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { type InsumoRepository, InsumoNoEncontrado } from '../../domain';
import { mapearInsumoADto, type InsumoDto } from '../insumo.dto';
import { INSUMO_REPOSITORY } from '../ports/tokens';
import type { RegistrarIngresoInsumoCommand } from './registrar-ingreso-insumo.command';

@Injectable()
export class RegistrarIngresoInsumoHandler
  implements CasoDeUso<RegistrarIngresoInsumoCommand, InsumoDto>
{
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
  ) {}

  async ejecutar(command: RegistrarIngresoInsumoCommand): Promise<InsumoDto> {
    const insumo = await this.insumos.buscarPorId(command.insumoId);
    if (!insumo) {
      throw new InsumoNoEncontrado(command.insumoId);
    }

    insumo.ingresar(command.cantidad);
    await this.insumos.guardar(insumo);

    return mapearInsumoADto(insumo);
  }
}
