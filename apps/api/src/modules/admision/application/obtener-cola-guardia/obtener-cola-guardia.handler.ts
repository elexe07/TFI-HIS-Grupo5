import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { TRIAJE_REPOSITORY, type TriajeRepository } from '../../domain/triaje.repository';
import { aTriajeDto, type TriajeDto } from '../triaje.dto';

/** ADM-07. Cola de guardia: devuelve los pacientes en espera ordenados por nivel de urgencia y luego llegada. */
@Injectable()
export class ObtenerColaGuardiaHandler implements CasoDeUso<void, TriajeDto[]> {
  constructor(@Inject(TRIAJE_REPOSITORY) private readonly triajes: TriajeRepository) {}

  async ejecutar(): Promise<TriajeDto[]> {
    const cola = await this.triajes.obtenerColaGuardia();
    return cola.map(aTriajeDto);
  }
}

