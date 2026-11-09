import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { EventosProcesadosRepository, InsumoRepository } from '../../domain';
import {
  EVENTOS_PROCESADOS_REPOSITORY,
  INSUMO_REPOSITORY,
} from '../ports/tokens';

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
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
    @Inject(EVENTOS_PROCESADOS_REPOSITORY)
    private readonly eventosProcesados: EventosProcesadosRepository,
  ) {}

  @OnEvent(EVENTO_MEDICACION_ADMINISTRADA)
  async manejar(evento: MedicacionAdministradaPayload): Promise<void> {
    try {
      const yaProcesado = await this.eventosProcesados.haSidoProcesado(evento.eventoId);
      if (yaProcesado) {
        return;
      }

      // 1. Descontar medicamento principal
      const insumoMed = await this.insumos.buscarPorMedicamentoAsociado(evento.medicamento);
      if (insumoMed) {
        insumoMed.descontar(1);
        await this.insumos.guardar(insumoMed);
        this.logger.log(
          `Stock de medicamento '${evento.medicamento}' descontado correctamente para evento '${evento.eventoId}'.`,
        );
      } else {
        this.logger.warn(
          `No se encontró insumo asociado para el medicamento '${evento.medicamento}'.`,
        );
      }

      const medLower = evento.medicamento.toLowerCase();
      const esInyectable =
        medLower.includes('inyectable') ||
        medLower.includes('iny.') ||
        medLower.includes('inyeccion') ||
        medLower.includes('dexametasona');

      // 2. Si es inyectable, consume automáticamente 1 jeringa y 1 gasa (antisepsia/hemostasia)
      if (esInyectable) {
        const jeringa = await this.insumos.buscarPorCodigo('JER5');
        if (jeringa) {
          jeringa.descontar(1);
          await this.insumos.guardar(jeringa);
          this.logger.log(
            `Stock de Jeringa (JER5) descontado para administración inyectable en evento '${evento.eventoId}'.`,
          );
        }

        const gasa = await this.insumos.buscarPorCodigo('GASA');
        if (gasa) {
          gasa.descontar(1);
          await this.insumos.guardar(gasa);
          this.logger.log(
            `Stock de Gasa (GASA) descontado para antisepsia en inyección en evento '${evento.eventoId}'.`,
          );
        }
      }

      // 3. Si la indicación es de curación, consume 2 gasas
      if (medLower.includes('curacion') || medLower.includes('curación') || medLower.includes('gasa')) {
        const gasa = await this.insumos.buscarPorCodigo('GASA');
        if (gasa) {
          gasa.descontar(2);
          await this.insumos.guardar(gasa);
          this.logger.log(
            `Stock de Gasas (GASA x2) descontado para curación en evento '${evento.eventoId}'.`,
          );
        }
      }

      await this.eventosProcesados.registrarProcesado(evento.eventoId);
    } catch (error) {
      this.logger.error(
        `Error al descontar stock para medicamento '${evento.medicamento}': ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
