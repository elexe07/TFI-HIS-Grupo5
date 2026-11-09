import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { CuentaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  mapearCuentaADetalleDto,
  type CuentaDetalleDto,
} from '../consultar-cuenta/cuenta-detalle.dto';

@Injectable()
export class CerrarCuentaManualHandler {
  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async ejecutar(cuentaId: string): Promise<CuentaDetalleDto> {
    const cuenta = await this.cuentaRepo.buscarPorId(cuentaId);
    if (!cuenta) {
      throw new CuentaNoEncontrada(cuentaId);
    }

    const ahora = this.clock.ahora();
    cuenta.cerrar(ahora);
    await this.cuentaRepo.guardar(cuenta);

    return mapearCuentaADetalleDto(cuenta);
  }
}
