import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { IndicacionNoEncontrada } from '../../domain/errores';
import {
  INDICACION_REPOSITORY,
  type IndicacionRepository,
} from '../../domain/indicacion.repository';
import {
  mapearIndicacionADto,
  type IndicacionDto,
} from '../dtos/indicacion.dto';
import { OmitirIndicacionCommand } from './omitir-indicacion.command';

@Injectable()
export class OmitirIndicacionHandler
  implements CasoDeUso<OmitirIndicacionCommand, IndicacionDto>
{
  constructor(
    @Inject(INDICACION_REPOSITORY)
    private readonly indicacionRepo: IndicacionRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: OmitirIndicacionCommand): Promise<IndicacionDto> {
    const indicacion = await this.indicacionRepo.buscarPorId(command.indicacionId);
    if (!indicacion) {
      throw new IndicacionNoEncontrada(command.indicacionId);
    }

    indicacion.omitir(command.motivo, this.reloj.ahora());
    await this.indicacionRepo.guardar(indicacion);

    return mapearIndicacionADto(indicacion);
  }
}

