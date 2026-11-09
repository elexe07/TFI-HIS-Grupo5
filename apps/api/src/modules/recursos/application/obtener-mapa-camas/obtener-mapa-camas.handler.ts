import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  type Cama,
  type CamaRepository,
  EstadoCama,
  type Habitacion,
  type HabitacionRepository,
  type InternacionRepository,
} from '../../domain';
import {
  CAMA_REPOSITORY,
  HABITACION_REPOSITORY,
  INTERNACION_REPOSITORY,
} from '../ports/tokens';
import type {
  CamaMapaDto,
  HabitacionMapaDto,
  MapaCamasDto,
  TotalesCamasDto,
} from './mapa-camas.dto';
import type { ObtenerMapaCamasQuery } from './obtener-mapa-camas.query';

@Injectable()
export class ObtenerMapaCamasHandler
  implements CasoDeUso<ObtenerMapaCamasQuery, MapaCamasDto>
{
  constructor(
    @Inject(HABITACION_REPOSITORY)
    private readonly habitaciones: HabitacionRepository,
    @Inject(CAMA_REPOSITORY)
    private readonly camas: CamaRepository,
    @Inject(INTERNACION_REPOSITORY)
    private readonly internaciones: InternacionRepository,
  ) {}

  async ejecutar(_query: ObtenerMapaCamasQuery): Promise<MapaCamasDto> {
    const listaHabitaciones = await this.habitaciones.listarTodas();
    const listaCamas = await this.camas.listarTodas();

    const totales = this.calcularTotales(listaCamas);
    const habitacionesDto = await Promise.all(
      listaHabitaciones.map((h) => this.mapearHabitacion(h, listaCamas)),
    );

    return { totales, habitaciones: habitacionesDto };
  }

  private calcularTotales(camas: Cama[]): TotalesCamasDto {
    const totales = {
      libre: 0,
      ocupada: 0,
      enLimpieza: 0,
      bloqueada: 0,
      total: camas.length,
    };

    for (const cama of camas) {
      if (cama.estado === EstadoCama.LIBRE) totales.libre++;
      else if (cama.estado === EstadoCama.OCUPADA) totales.ocupada++;
      else if (cama.estado === EstadoCama.EN_LIMPIEZA) totales.enLimpieza++;
      else if (cama.estado === EstadoCama.BLOQUEADA) totales.bloqueada++;
    }

    return totales;
  }

  private async mapearHabitacion(
    hab: Habitacion,
    todasLasCamas: Cama[],
  ): Promise<HabitacionMapaDto> {
    const camasHabitacion = todasLasCamas.filter((c) => c.habitacionId === hab.id);
    const camasDto = await Promise.all(
      camasHabitacion.map((cama) => this.mapearCama(cama)),
    );

    return {
      id: hab.id,
      sector: hab.sector,
      numero: hab.numero,
      camas: camasDto,
    };
  }

  private async mapearCama(cama: Cama): Promise<CamaMapaDto> {
    let internacionActiva = null;
    if (cama.estado === EstadoCama.OCUPADA) {
      const activa = await this.internaciones.buscarActivaPorCamaId(cama.id);
      if (activa) {
        internacionActiva = {
          id: activa.id,
          pacienteId: activa.pacienteId,
          ingresoEn: activa.ingresoEn.toISOString(),
          medicoId: activa.medicoId,
        };
      }
    }

    return {
      id: cama.id,
      codigo: cama.codigo,
      estado: cama.estado,
      internacionActiva,
    };
  }
}
