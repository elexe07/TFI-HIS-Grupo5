import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
  EVENT_BUS,
  type EventBus,
} from '../../../../building-blocks/application';
import {
  IndicacionNoEncontrada,
  MedicacionYaAdministrada,
} from '../../domain/errores';
import {
  INDICACION_REPOSITORY,
  type IndicacionRepository,
} from '../../domain/indicacion.repository';
import {
  ADMINISTRACION_MEDICACION_REPOSITORY,
  type AdministracionMedicacionRepository,
} from '../../domain/administracion-medicacion.repository';
import {
  mapearAdministracionADto,
  type AdministracionMedicacionDto,
} from '../dtos/administracion-medicacion.dto';
import { AdministrarMedicacionCommand } from './administrar-medicacion.command';

@Injectable()
export class AdministrarMedicacionHandler
  implements CasoDeUso<AdministrarMedicacionCommand, AdministracionMedicacionDto>
{
  // eslint-disable-next-line max-params
  constructor(
    @Inject(INDICACION_REPOSITORY)
    private readonly indicacionRepo: IndicacionRepository,
    @Inject(ADMINISTRACION_MEDICACION_REPOSITORY)
    private readonly administracionRepo: AdministracionMedicacionRepository,
    @Inject(EVENT_BUS)
    private readonly bus: EventBus,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: AdministrarMedicacionCommand): Promise<AdministracionMedicacionDto> {
    const indicacion = await this.indicacionRepo.buscarPorId(command.indicacionId);
    if (!indicacion) {
      throw new IndicacionNoEncontrada(command.indicacionId);
    }

    const administracionPrevia = await this.administracionRepo.buscarPorIndicacionId(
      command.indicacionId,
    );
    if (administracionPrevia) {
      throw new MedicacionYaAdministrada(command.indicacionId);
    }

    const administradaEn = this.reloj.ahora();
    const administracion = indicacion.administrar(command.administradaPor, administradaEn);

    await this.indicacionRepo.guardar(indicacion);
    await this.administracionRepo.guardar(administracion);
    await this.bus.publicar(indicacion.extraerEventos());

    return mapearAdministracionADto(administracion);
  }
}
