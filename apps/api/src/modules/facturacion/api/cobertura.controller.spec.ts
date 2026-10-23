import { RelojFijo } from '../../../building-blocks/testing';
import { ValidarCoberturaHandler } from '../application/validar-cobertura/validar-cobertura.handler';
import {
  CuentaRepositoryEnMemoria,
  ObraSocialRepositoryEnMemoria,
  ValidadorDeCoberturaFalso,
} from '../testing';
import { CoberturaController } from './cobertura.controller';

describe('CoberturaController', () => {
  let controller: CoberturaController;
  let obraSocialRepo: ObraSocialRepositoryEnMemoria;
  let cuentaRepo: CuentaRepositoryEnMemoria;

  beforeEach(() => {
    obraSocialRepo = new ObraSocialRepositoryEnMemoria();
    cuentaRepo = new CuentaRepositoryEnMemoria();
    const validador = new ValidadorDeCoberturaFalso(obraSocialRepo);
    const handler = new ValidarCoberturaHandler(
      validador,
      cuentaRepo,
      new RelojFijo(new Date('2026-10-23T10:00:00Z')),
    );
    controller = new CoberturaController(handler);
  });

  it('debería responder con el resultado de validación de cobertura', async () => {
    const res = await controller.validar({
      pacienteId: 'pac-1',
      codigoObraSocial: 'OSDE',
      numeroAfiliado: '123456',
    });

    expect(res.aprobada).toBe(true);
    expect(res.porcentajeCobertura).toBe(80);
  });
});

