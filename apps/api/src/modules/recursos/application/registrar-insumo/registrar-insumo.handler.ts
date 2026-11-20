import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  Insumo,
  INSUMO_REPOSITORY,
  type InsumoRepository,
  InsumoYaExiste,
  MedicamentoYaAsociado,
} from '../../domain';
import { mapearInsumoADto, type InsumoDto } from '../insumo.dto';
import type { RegistrarInsumoCommand } from './registrar-insumo.command';

/** Alta de un insumo nuevo en el inventario (POST /insumos). */
@Injectable()
export class RegistrarInsumoHandler implements CasoDeUso<RegistrarInsumoCommand, InsumoDto> {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
  ) {}

  async ejecutar(command: RegistrarInsumoCommand): Promise<InsumoDto> {
    const insumo = Insumo.crear({
      codigo: command.codigo,
      nombre: command.nombre,
      medicamentoAsociado: command.medicamentoAsociado,
      stockActual: command.stockInicial,
      stockMinimo: command.stockMinimo,
    });

    if (await this.insumos.buscarPorCodigo(insumo.codigo)) {
      throw new InsumoYaExiste(insumo.codigo);
    }
    if (insumo.medicamentoAsociado) {
      const otro = await this.insumos.buscarPorMedicamentoAsociado(insumo.medicamentoAsociado);
      if (otro) throw new MedicamentoYaAsociado(insumo.medicamentoAsociado, otro.codigo);
    }

    await this.insumos.guardar(insumo);
    return mapearInsumoADto(insumo);
  }
}
