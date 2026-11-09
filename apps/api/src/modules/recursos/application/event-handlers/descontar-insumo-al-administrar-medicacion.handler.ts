import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DescontarInsumoPorEventoCommand } from '../descontar-insumo-evento/descontar-insumo-evento.command';
import { DescontarInsumoPorEventoHandler } from '../descontar-insumo-evento/descontar-insumo-evento.handler';

export interface MedicacionAdministradaPayload {
  eventoId: string;
  ocurridoEn: Date;
  administracionId: string;
  pacienteId: string;
  internacionId: string;
  medicamento: string;
}

export const EVENTO_MEDICACION_ADMINISTRADA = 'enfermeria.medicacion-administrada';

@Injectable()
export class DescontarInsumoAlAdministrarMedicacionHandler {
  private readonly logger = new Logger(
    DescontarInsumoAlAdministrarMedicacionHandler.name,
  );

  constructor(
    private readonly descontarInsumo: DescontarInsumoPorEventoHandler,
  ) {}

  @OnEvent(EVENTO_MEDICACION_ADMINISTRADA)
  async manejar(evento: MedicacionAdministradaPayload): Promise<void> {
    try {
      await this.descontarInsumo.ejecutar(
        new DescontarInsumoPorEventoCommand({
          eventoId: evento.eventoId,
          medicamento: evento.medicamento,
          cantidad: 1,
        }),
      );
      this.logger.log(
        `Stock de medicamento '${evento.medicamento}' descontado correctamente para evento '${evento.eventoId}'.`,
      );
    } catch (error) {
      this.logger.error(
        `Error al descontar stock para medicamento '${evento.medicamento}': ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
