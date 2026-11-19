import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso, Solicitante } from '../../../../building-blocks/application';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/cuenta.repository';
import {
  DIRECTORIO_DE_PACIENTES,
  type DirectorioDePacientes,
} from '../../domain/directorio-de-pacientes';
import {
  mapearCuentaADetalleDto,
  type CuentaDetalleDto,
} from '../consultar-cuenta/cuenta-detalle.dto';

export interface ListarCuentasPacienteQuery {
  readonly pacienteId?: string;
  readonly solicitante?: Solicitante;
}

/** Lista cuentas (opcionalmente de un paciente). Si pide un paciente, solo ve las suyas. */
@Injectable()
export class ListarCuentasPacienteHandler implements CasoDeUso<
  ListarCuentasPacienteQuery,
  CuentaDetalleDto[]
> {
  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(DIRECTORIO_DE_PACIENTES)
    private readonly pacientes: DirectorioDePacientes,
  ) {}

  async ejecutar(query: ListarCuentasPacienteQuery): Promise<CuentaDetalleDto[]> {
    let pacienteId = query.pacienteId;
    if (query.solicitante?.esPaciente) {
      const propio = await this.pacientes.pacienteIdDelUsuario(query.solicitante.usuarioId);
      if (!propio) return [];
      pacienteId = propio;
    }

    const cuentas = await this.cuentaRepo.listarPorPaciente(pacienteId);
    return cuentas.map(mapearCuentaADetalleDto);
  }
}
