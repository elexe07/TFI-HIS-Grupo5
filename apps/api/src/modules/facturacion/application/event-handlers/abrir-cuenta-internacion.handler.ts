import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { PACIENTE_INTERNADO, type PacienteInternado } from '../../../recursos/public';
import { Cuenta } from '../../domain/cuenta';
import { TipoCuenta } from '../../domain/enums';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';

@Injectable()
export class AbrirCuentaInternacionHandler {
  private readonly logger = new Logger(AbrirCuentaInternacionHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(PACIENTE_INTERNADO)
  async manejar(evento: PacienteInternado): Promise<void> {
    const { internacionId, pacienteId, ingresoEn } = evento.payload;

    const cuentaExistente = await this.cuentaRepo.buscarPorTipoYReferencia(
      TipoCuenta.INTERNACION,
      internacionId,
    );

    if (cuentaExistente) {
      this.logger.debug(`La cuenta de internación para ${internacionId} ya existe`);
      return;
    }

    const ahora = this.clock.ahora();
    const fechaApertura = ingresoEn ? new Date(ingresoEn) : ahora;

    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.INTERNACION,
      referenciaId: internacionId,
      ahora: fechaApertura,
    });

    await this.cuentaRepo.guardar(cuenta);
    this.logger.log(`Cuenta de internación abierta para ${internacionId} (paciente ${pacienteId})`);
  }
}
