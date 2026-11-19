import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import {
  OBRA_SOCIAL_REPOSITORY,
  type ObraSocialRepository,
} from '../../domain/obra-social.repository';

export interface ObraSocialDto {
  id: string;
  codigo: string;
  nombre: string;
  porcentajeCobertura: number;
}

@Injectable()
export class ListarObrasSocialesHandler implements CasoDeUso<void, ObraSocialDto[]> {
  constructor(
    @Inject(OBRA_SOCIAL_REPOSITORY)
    private readonly obrasSociales: ObraSocialRepository,
  ) {}

  async ejecutar(): Promise<ObraSocialDto[]> {
    const lista = await this.obrasSociales.listarTodas();
    return lista.map((os) => ({
      id: os.id,
      codigo: os.codigo,
      nombre: os.nombre,
      porcentajeCobertura: os.porcentajeCobertura,
    }));
  }
}
