import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PRESCRIPCION_CREADA,
  type PrescripcionCreadaEvent,
} from '../../../hce/public';
import { GenerarIndicacionesCommand } from '../generar-indicaciones/generar-indicaciones.command';
import { GenerarIndicacionesHandler } from '../generar-indicaciones/generar-indicaciones.handler';

@Injectable()
export class OnPrescripcionCreadaHandler {
  private readonly logger = new Logger(OnPrescripcionCreadaHandler.name);

  constructor(private readonly generarIndicaciones: GenerarIndicacionesHandler) {}

  @OnEvent(PRESCRIPCION_CREADA)
  async manejar(evento: PrescripcionCreadaEvent): Promise<void> {
    this.logger.log(
      `Generando indicaciones para prescripción ${evento.prescripcionId} (evento ${evento.eventoId})`,
    );

    const inicioEn =
      evento.inicioEn instanceof Date ? evento.inicioEn : new Date(evento.inicioEn);

    await this.generarIndicaciones.ejecutar(
      new GenerarIndicacionesCommand({
        prescripcionId: evento.prescripcionId,
        pacienteId: evento.pacienteId,
        internacionId: evento.internacionId,
        medicamento: evento.medicamento,
        dosis: evento.dosis,
        frecuenciaHoras: evento.frecuenciaHoras,
        duracionDias: evento.duracionDias,
        inicioEn,
      }),
    );
  }
}
