import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import { CuentaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import { mapearCuentaADetalleDto, type CuentaDetalleDto } from './cuenta-detalle.dto';

export interface ConsultarCuentaQuery {
  readonly cuentaId: string;
}

@Injectable()
export class ConsultarCuentaHandler implements CasoDeUso<ConsultarCuentaQuery, CuentaDetalleDto> {
  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
  ) {}

  async ejecutar(query: ConsultarCuentaQuery): Promise<CuentaDetalleDto> {
    const cuenta = await this.cuentaRepo.buscarPorId(query.cuentaId);
    if (!cuenta) {
      throw new CuentaNoEncontrada();
    }
    return mapearCuentaADetalleDto(cuenta);
  }
}
