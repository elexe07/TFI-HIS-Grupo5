import { SetMetadata } from '@nestjs/common';

export const ES_PUBLICO = 'iam:publico';

/**
 * Marca un endpoint (o un controller entero) como accesible sin token.
 * Todo lo que no tenga esta marca exige autenticación.
 */
export const Publico = () => SetMetadata(ES_PUBLICO, true);
