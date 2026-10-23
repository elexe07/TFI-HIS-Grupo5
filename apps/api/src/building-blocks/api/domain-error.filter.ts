import { type ArgumentsHost, Catch, type ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError, type TipoDeError } from '../domain/domain-error';

const STATUS_POR_TIPO: Record<TipoDeError, HttpStatus> = {
  VALIDACION: HttpStatus.BAD_REQUEST,
  NO_ENCONTRADO: HttpStatus.NOT_FOUND,
  CONFLICTO: HttpStatus.CONFLICT,
  NO_AUTORIZADO: HttpStatus.UNAUTHORIZED,
  PROHIBIDO: HttpStatus.FORBIDDEN,
};

/**
 * Traduce errores de dominio a respuestas HTTP. Así los controllers no tienen try/catch
 * y el dominio no sabe nada de HTTP.
 */
@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter<DomainError> {
  catch(error: DomainError, host: ArgumentsHost): void {
    const respuesta = host.switchToHttp().getResponse<Response>();
    const status = STATUS_POR_TIPO[error.tipo];

    respuesta.status(status).json({
      statusCode: status,
      tipo: error.tipo,
      codigo: error.codigo,
      mensaje: error.message,
    });
  }
}
