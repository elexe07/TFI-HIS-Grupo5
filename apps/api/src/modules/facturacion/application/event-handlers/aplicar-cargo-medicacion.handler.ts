import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { MEDICACION_ADMINISTRADA, type MedicacionAdministrada } from '../../../enfermeria/public';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { TarifaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../../domain/ports/tarifa.repository';

@Injectable()
export class AplicarCargoMedicacionHandler {
  private readonly logger = new Logger(AplicarCargoMedicacionHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifaRepo: TarifaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(MEDICACION_ADMINISTRADA)
  async manejar(evento: MedicacionAdministrada): Promise<void> {
    const yaProcesado = await this.cuentaRepo.existeCargoConOrigenEvento(evento.eventoId);
    if (yaProcesado) {
      this.logger.debug(`Evento ${evento.eventoId} ya fue procesado anteriormente`);
      return;
    }

    const { pacienteId, internacionId, medicamento } = evento.payload;
    const ahora = this.clock.ahora();

    let cuenta = await this.cuentaRepo.buscarPorTipoYReferencia(
      TipoCuenta.INTERNACION,
      internacionId,
    );

    if (!cuenta) {
      cuenta = Cuenta.abrir({
        pacienteId,
        tipo: TipoCuenta.INTERNACION,
        referenciaId: internacionId,
        ahora,
      });
    }

    const tarifa = await this.tarifaRepo.buscarPorConcepto(ConceptoCargo.MEDICACION);
    if (!tarifa) {
      throw new TarifaNoEncontrada(ConceptoCargo.MEDICACION);
    }

    const cargo = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.MEDICACION,
      descripcion: `Medicación: ${medicamento}`,
      cantidad: 1,
      montoUnitario: tarifa.monto,
      origenEventoId: evento.eventoId,
      createdAt: ahora,
    });

    cuenta.agregarCargo(cargo, ahora);
    await this.cuentaRepo.guardar(cuenta);

    this.logger.log(
      `Cargo de medicación (${medicamento}) aplicado a cuenta ${cuenta.id} por evento ${evento.eventoId}`,
    );
  }
}
