import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { SALUDO_REPOSITORY, type SaludoRepository } from '../../domain/saludo.repository';

export interface SaludoDto {
  id: string;
  destinatario: string;
  mensaje: string;
  creadoEn: string;
}

/** Query: solo lee y devuelve DTOs planos. No devuelve entidades de dominio hacia afuera. */
@Injectable()
export class ListarSaludosHandler implements CasoDeUso<void, SaludoDto[]> {
  constructor(@Inject(SALUDO_REPOSITORY) private readonly saludos: SaludoRepository) {}

  async ejecutar(): Promise<SaludoDto[]> {
    const saludos = await this.saludos.listar();
    return saludos.map((s) => ({
      id: s.id,
      destinatario: s.destinatario.valor,
      mensaje: s.mensaje,
      creadoEn: s.creadoEn.toISOString(),
    }));
  }
}
