import { Inject, Injectable } from '@nestjs/common';
import {
  OBRA_SOCIAL_REPOSITORY,
  type ObraSocialRepository,
} from '../../domain/ports/obra-social.repository';
import type {
  ResultadoValidacionCobertura,
  ValidadorDeCobertura,
} from '../../domain/ports/validador-de-cobertura';

/**
 * Adaptador simulado para obras sociales (ADR-001 / ADR-004 / Consigna).
 * Aprueba o rechaza según el código de obra social y número de afiliado.
 */
@Injectable()
export class ValidadorDeCoberturaFake implements ValidadorDeCobertura {
  constructor(
    @Inject(OBRA_SOCIAL_REPOSITORY)
    private readonly obraSocialRepo: ObraSocialRepository,
  ) {}

  async validar(
    _pacienteId: string,
    codigoObraSocial: string,
    numeroAfiliado: string,
  ): Promise<ResultadoValidacionCobertura> {
    const afiliadoLimpio = numeroAfiliado.trim().toUpperCase();

    // Regla de simulación: Afiliados con prefijo RECHAZADO o número '0000' se consideran inválidos
    if (afiliadoLimpio.startsWith('RECHAZADO') || afiliadoLimpio === '0000') {
      return {
        aprobada: false,
        porcentajeCobertura: 0,
        motivoRechazo: 'El carnet del afiliado se encuentra inhabilitado o dado de baja',
      };
    }

    const obraSocial = await this.obraSocialRepo.buscarPorCodigo(codigoObraSocial);
    if (!obraSocial) {
      return {
        aprobada: false,
        porcentajeCobertura: 0,
        motivoRechazo: `Obra social desconocida o no convenida: ${codigoObraSocial}`,
      };
    }

    return {
      aprobada: true,
      porcentajeCobertura: obraSocial.porcentajeCobertura,
    };
  }
}

