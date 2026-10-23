import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CLOCK, type Clock } from '../../../../building-blocks/application';
import { EVOLUCION_REGISTRADA, type EvolucionRegistrada } from '../../../hce/public';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { TarifaNoEncontrada } from '../../domain/errores';
import { CUENTA_REPOSITORY, type CuentaRepository } from '../../domain/ports/cuenta.repository';
import { TARIFA_REPOSITORY, type TarifaRepository } from '../../domain/ports/tarifa.repository';

@Injectable()
export class AplicarCargoConsultaHandler {
  private readonly logger = new Logger(AplicarCargoConsultaHandler.name);

  constructor(
    @Inject(CUENTA_REPOSITORY)
    private readonly cuentaRepo: CuentaRepository,
    @Inject(TARIFA_REPOSITORY)
    private readonly tarifaRepo: TarifaRepository,
    @Inject(CLOCK)
    private readonly clock: Clock,
  ) {}

  @OnEvent(EVOLUCION_REGISTRADA)
  async manejar(evento: EvolucionRegistrada): Promise<void> {
    if (await this.cuentaRepo.existeCargoConOrigenEvento(evento.eventoId)) {
      this.logger.debug(`Evento ${evento.eventoId} ya fue procesado anteriormente`);
      return;
    }

    const ahora = this.clock.ahora();
    const cuenta = await this.resolverCuenta(evento, ahora);

    const tarifa = await this.tarifaRepo.buscarPorConcepto(ConceptoCargo.CONSULTA);
    if (!tarifa) {
      throw new TarifaNoEncontrada(ConceptoCargo.CONSULTA);
    }

    const cargo = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.CONSULTA,
      descripcion: 'Consulta médica',
      cantidad: 1,
      montoUnitario: tarifa.monto,
      origenEventoId: evento.eventoId,
      createdAt: ahora,
    });

    cuenta.agregarCargo(cargo, ahora);
    await this.cuentaRepo.guardar(cuenta);
    this.logger.log(`Cargo consulta registrado en cuenta ${cuenta.id} (evento ${evento.eventoId})`);
  }

  private async resolverCuenta(evento: EvolucionRegistrada, ahora: Date): Promise<Cuenta> {
    const { pacienteId, evolucionId, turnoId, internacionId } = evento.payload;
    if (internacionId) {
      const cuentaInt = await this.cuentaRepo.buscarPorTipoYReferencia(
        TipoCuenta.INTERNACION,
        internacionId,
      );
      if (cuentaInt) return cuentaInt;
    }

    const refId = turnoId ?? evolucionId;
    const cuentaCons = await this.cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.CONSULTA, refId);
    if (cuentaCons) return cuentaCons;

    return Cuenta.abrir({ pacienteId, tipo: TipoCuenta.CONSULTA, referenciaId: refId, ahora });
  }
}
