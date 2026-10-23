import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { Indicacion } from '../../domain/indicacion';
import {
  INDICACION_REPOSITORY,
  type IndicacionRepository,
} from '../../domain/indicacion.repository';
import {
  GenerarIndicacionesCommand,
  type GenerarIndicacionesResultado,
} from './generar-indicaciones.command';

@Injectable()
export class GenerarIndicacionesHandler
  implements CasoDeUso<GenerarIndicacionesCommand, GenerarIndicacionesResultado>
{
  constructor(
    @Inject(INDICACION_REPOSITORY)
    private readonly indicacionesRepo: IndicacionRepository,
  ) {}

  async ejecutar(command: GenerarIndicacionesCommand): Promise<GenerarIndicacionesResultado> {
    if (command.frecuenciaHoras <= 0 || command.duracionDias <= 0) {
      return { prescripcionId: command.prescripcionId, generadas: 0, omitidasPorExistentes: 0 };
    }

    const cantidadTotal = Math.floor((24 / command.frecuenciaHoras) * command.duracionDias);
    const { nuevas, omitidas } = await this.construirIndicaciones(command, cantidadTotal);

    if (nuevas.length > 0) {
      await this.indicacionesRepo.guardarMuchas(nuevas);
    }

    return {
      prescripcionId: command.prescripcionId,
      generadas: nuevas.length,
      omitidasPorExistentes: omitidas,
    };
  }

  private async construirIndicaciones(
    command: GenerarIndicacionesCommand,
    cantidadTotal: number,
  ): Promise<{ nuevas: Indicacion[]; omitidas: number }> {
    const descripcion = `${command.medicamento} ${command.dosis}`.trim();
    const nuevas: Indicacion[] = [];
    let omitidas = 0;

    for (let i = 0; i < cantidadTotal; i++) {
      const ms = i * command.frecuenciaHoras * 3600 * 1000;
      const programadaPara = new Date(command.inicioEn.getTime() + ms);

      const existe = await this.indicacionesRepo.existePorPrescripcionYFecha(
        command.prescripcionId,
        programadaPara,
      );

      if (existe) {
        omitidas++;
      } else {
        nuevas.push(
          Indicacion.crear({
            internacionId: command.internacionId,
            pacienteId: command.pacienteId,
            prescripcionId: command.prescripcionId,
            descripcion,
            programadaPara,
          }),
        );
      }
    }

    return { nuevas, omitidas };
  }
}

