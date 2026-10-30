import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { SignosVitales } from '../../domain/signos-vitales';
import {
  SIGNOS_VITALES_REPOSITORY,
  type SignosVitalesRepository,
} from '../../domain/signos-vitales.repository';
import {
  mapearSignosVitalesADto,
  type SignosVitalesDto,
} from '../dtos/signos-vitales.dto';
import { RegistrarSignosVitalesCommand } from './registrar-signos-vitales.command';

@Injectable()
export class RegistrarSignosVitalesHandler
  implements CasoDeUso<RegistrarSignosVitalesCommand, SignosVitalesDto>
{
  constructor(
    @Inject(SIGNOS_VITALES_REPOSITORY)
    private readonly repository: SignosVitalesRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarSignosVitalesCommand): Promise<SignosVitalesDto> {
    const signosVitales = SignosVitales.crear({
      pacienteId: command.pacienteId,
      internacionId: command.props.internacionId,
      temperatura: command.props.temperatura,
      presionSistolica: command.props.presionSistolica,
      presionDiastolica: command.props.presionDiastolica,
      frecuenciaCardiaca: command.props.frecuenciaCardiaca,
      saturacionO2: command.props.saturacionO2,
      registradoEn: this.reloj.ahora(),
      registradoPor: command.registradoPor,
    });

    await this.repository.guardar(signosVitales);

    return mapearSignosVitalesADto(signosVitales);
  }
}

