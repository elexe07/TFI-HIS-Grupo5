import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { PACIENTE_DADO_DE_ALTA, type PacienteDadoDeAlta } from '../../../recursos/public';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { TarifaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../../domain/ports/tarifa.repository';

@Injectable()
export class CerrarCuentaInternacionHandler {
  private readonly logger = new Logger(CerrarCuentaInternacionHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifaRepo: TarifaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(PACIENTE_DADO_DE_ALTA)
  async manejar(evento: PacienteDadoDeAlta): Promise<void> {
    if (await this.cuentaRepo.existeCargoConOrigenEvento(evento.eventoId)) {
      this.logger.debug(`Evento ${evento.eventoId} ya fue procesado`);
      return;
    }

    const { internacionId, pacienteId, ingresoEn, egresoEn } = evento.payload;
    const ahora = this.clock.ahora();
    const cuenta =
      (await this.cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, internacionId)) ??
      Cuenta.abrir({
        pacienteId,
        tipo: TipoCuenta.INTERNACION,
        referenciaId: internacionId,
        ahora,
      });

    const dias = this.calcularDias(ingresoEn, egresoEn);
    const tarifa = await this.tarifaRepo.buscarPorConcepto(ConceptoCargo.DIA_CAMA);
    if (!tarifa) {
      throw new TarifaNoEncontrada(ConceptoCargo.DIA_CAMA);
    }

    cuenta.agregarCargo(
      Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.DIA_CAMA,
        descripcion: dias === 1 ? '1 día de cama' : `${dias} días de cama`,
        cantidad: dias,
        montoUnitario: tarifa.monto,
        origenEventoId: evento.eventoId,
        createdAt: ahora,
      }),
      ahora,
    );
    cuenta.cerrar(ahora);

    await this.cuentaRepo.guardar(cuenta);
    this.logger.log(
      `Cuenta ${cuenta.id} cerrada con ${dias} día(s) de cama (evento ${evento.eventoId})`,
    );
  }

  private calcularDias(ingresoEn: Date, egresoEn: Date): number {
    const diffMs = Math.max(0, new Date(egresoEn).getTime() - new Date(ingresoEn).getTime());
    return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
}
