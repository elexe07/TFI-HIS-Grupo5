import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import type { EventosProcesadosRepository, InsumoRepository } from '../../domain';
import { EVENTOS_PROCESADOS_REPOSITORY, INSUMO_REPOSITORY } from '../ports/tokens';
import type { DescontarInsumoPorEventoCommand } from './descontar-insumo-evento.command';

@Injectable()
export class DescontarInsumoPorEventoHandler implements CasoDeUso<
  DescontarInsumoPorEventoCommand,
  void
> {
  constructor(
    @Inject(INSUMO_REPOSITORY)
    private readonly insumos: InsumoRepository,
    @Inject(EVENTOS_PROCESADOS_REPOSITORY)
    private readonly eventosProcesados: EventosProcesadosRepository,
  ) {}

  async ejecutar(command: DescontarInsumoPorEventoCommand): Promise<void> {
    const yaProcesado = await this.eventosProcesados.haSidoProcesado(command.eventoId);
    if (yaProcesado) {
      return;
    }

    let insumo = null;
    if (command.codigo) {
      insumo = await this.insumos.buscarPorCodigo(command.codigo);
    } else if (command.medicamento) {
      insumo = await this.insumos.buscarPorMedicamentoAsociado(command.medicamento);
    }

    if (!insumo) {
      await this.eventosProcesados.registrarProcesado(command.eventoId);
      return;
    }

    insumo.descontar(command.cantidad);
    await this.insumos.guardar(insumo);
    await this.eventosProcesados.registrarProcesado(command.eventoId);
  }
}
