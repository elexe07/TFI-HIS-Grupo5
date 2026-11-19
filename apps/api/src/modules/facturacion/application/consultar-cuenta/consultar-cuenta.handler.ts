import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso, Solicitante } from '../../../../building-blocks/application';
import { CuentaAjena, CuentaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/cuenta.repository';
import {
  DIRECTORIO_DE_PACIENTES,
  type DirectorioDePacientes,
} from '../../domain/directorio-de-pacientes';
import { mapearCuentaADetalleDto, type CuentaDetalleDto } from './cuenta-detalle.dto';

export interface ConsultarCuentaQuery {
  readonly cuentaId: string;
  readonly solicitante?: Solicitante;
}

/** Detalle de una cuenta con sus cargos. Un paciente solo puede ver las suyas. */
@Injectable()
export class ConsultarCuentaHandler implements CasoDeUso<ConsultarCuentaQuery, CuentaDetalleDto> {
  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(DIRECTORIO_DE_PACIENTES)
    private readonly pacientes: DirectorioDePacientes,
  ) {}

  async ejecutar(query: ConsultarCuentaQuery): Promise<CuentaDetalleDto> {
    const cuenta = await this.cuentaRepo.buscarPorId(query.cuentaId);
    if (!cuenta) {
      throw new CuentaNoEncontrada();
    }
    if (query.solicitante?.esPaciente) {
      const propio = await this.pacientes.pacienteIdDelUsuario(query.solicitante.usuarioId);
      if (cuenta.pacienteId !== propio) throw new CuentaAjena();
    }
    return mapearCuentaADetalleDto(cuenta);
  }
}
