import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application/caso-de-uso';
import {
  CONSULTOR_DE_OCUPACION,
  type ConsultorDeOcupacion,
  type ResumenOcupacion,
} from '../../domain/ports/consultor-de-ocupacion';

@Injectable()
export class ReporteOcupacionHandler implements CasoDeUso<void, ResumenOcupacion> {
  constructor(
    @Inject(CONSULTOR_DE_OCUPACION)
    private readonly consultor: ConsultorDeOcupacion,
  ) {}

  async ejecutar(): Promise<ResumenOcupacion> {
    return this.consultor.consultarOcupacion();
  }
}

