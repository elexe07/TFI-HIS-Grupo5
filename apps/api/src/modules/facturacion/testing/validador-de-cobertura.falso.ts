import {
  type ResultadoValidacionCobertura,
  type ValidadorDeCobertura,
} from '../domain/ports/validador-de-cobertura';
import type { ObraSocialRepository } from '../domain/ports/obra-social.repository';

export class ValidadorDeCoberturaFalso implements ValidadorDeCobertura {
  constructor(private readonly obraSocialRepo?: ObraSocialRepository) {}

  async validar(
    _pacienteId: string,
    codigoObraSocial: string,
    numeroAfiliado: string,
  ): Promise<ResultadoValidacionCobertura> {
    if (numeroAfiliado.toUpperCase().includes('RECHAZADO') || numeroAfiliado === '0000') {
      return {
        aprobada: false,
        porcentajeCobertura: 0,
        motivoRechazo: 'Afiliado dado de baja o inexistente',
      };
    }

    if (this.obraSocialRepo) {
      const os = await this.obraSocialRepo.buscarPorCodigo(codigoObraSocial);
      return os
        ? { aprobada: true, porcentajeCobertura: os.porcentajeCobertura }
        : {
            aprobada: false,
            porcentajeCobertura: 0,
            motivoRechazo: `Obra social desconocida: ${codigoObraSocial}`,
          };
    }

    const porcentajes: Record<string, number> = { PARTICULAR: 0, OSDE: 80, PAMI: 100 };
    const codigo = codigoObraSocial.toUpperCase();
    return codigo in porcentajes
      ? { aprobada: true, porcentajeCobertura: porcentajes[codigo] ?? 0 }
      : {
          aprobada: false,
          porcentajeCobertura: 0,
          motivoRechazo: `Obra social no convenida: ${codigoObraSocial}`,
        };
  }
}
