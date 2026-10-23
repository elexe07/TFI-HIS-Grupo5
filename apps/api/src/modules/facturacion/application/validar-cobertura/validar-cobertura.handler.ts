import { Inject, Injectable } from '@nestjs/common';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import {
  VALIDADOR_DE_COBERTURA,
  type ValidadorDeCobertura,
} from '../../domain/ports/validador-de-cobertura';
import type {
  ValidarCoberturaCommand,
  ValidarCoberturaResultado,
} from './validar-cobertura.command';

@Injectable()
export class ValidarCoberturaHandler implements CasoDeUso<
  ValidarCoberturaCommand,
  ValidarCoberturaResultado
> {
  constructor(
    @Inject(VALIDADOR_DE_COBERTURA)
    private readonly validador: ValidadorDeCobertura,
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  async ejecutar(command: ValidarCoberturaCommand): Promise<ValidarCoberturaResultado> {
    const resultado = await this.validador.validar(
      command.pacienteId,
      command.codigoObraSocial,
      command.numeroAfiliado,
    );

    let cuentaActualizada = false;
    if (resultado.aprobada && command.cuentaId) {
      const cuenta = await this.cuentaRepo.buscarPorId(command.cuentaId);
      if (cuenta) {
        cuenta.aplicarCobertura(resultado.porcentajeCobertura, this.clock.ahora());
        await this.cuentaRepo.guardar(cuenta);
        cuentaActualizada = true;
      }
    }

    return {
      aprobada: resultado.aprobada,
      porcentajeCobertura: resultado.porcentajeCobertura,
      motivoRechazo: resultado.motivoRechazo,
      cuentaActualizada,
    };
  }
}
