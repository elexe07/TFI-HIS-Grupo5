import type { ArgumentsHost } from '@nestjs/common';
import { Conflicto, ErrorDeValidacion, NoEncontrado } from '../domain/domain-error';
import { DomainErrorFilter } from './domain-error.filter';

function hostFalso() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('DomainErrorFilter', () => {
  it.each([
    [new ErrorDeValidacion('mal', 'X'), 400],
    [new NoEncontrado('no está', 'Y'), 404],
    [new Conflicto('ya existe', 'Z'), 409],
  ])('traduce %p al status %i', (error, esperado) => {
    const { host, status, json } = hostFalso();

    new DomainErrorFilter().catch(error, host);

    expect(status).toHaveBeenCalledWith(esperado);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: esperado,
        codigo: error.codigo,
        mensaje: error.message,
      }),
    );
  });
});
