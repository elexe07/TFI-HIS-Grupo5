import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  mapearCuentaADetalleDto,
  type CuentaDetalleDto,
} from '../consultar-cuenta/cuenta-detalle.dto';

export interface ListarCuentasPacienteQuery {
  readonly pacienteId: string;
}

@Injectable()
export class ListarCuentasPacienteHandler implements CasoDeUso<
  ListarCuentasPacienteQuery,
  CuentaDetalleDto[]
> {
  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
  ) {}

  async ejecutar(query: ListarCuentasPacienteQuery): Promise<CuentaDetalleDto[]> {
    const cuentas = await this.cuentaRepo.listarPorPaciente(query.pacienteId);
    return cuentas.map(mapearCuentaADetalleDto);
  }
}
