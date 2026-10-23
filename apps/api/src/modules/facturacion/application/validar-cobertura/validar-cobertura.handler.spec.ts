import { RelojFijo } from '../../../../building-blocks/testing';
import { Cuenta } from '../../domain/cuenta';
import { TipoCuenta } from '../../domain/enums';
import {
  CuentaRepositoryEnMemoria,
  ObraSocialRepositoryEnMemoria,
  ValidadorDeCoberturaFalso,
} from '../../testing';
import { ValidarCoberturaHandler } from './validar-cobertura.handler';

describe('ValidarCoberturaHandler', () => {
  let handler: ValidarCoberturaHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  let obraSocialRepo: ObraSocialRepositoryEnMemoria;
  let validador: ValidadorDeCoberturaFalso;
  const reloj = new RelojFijo(new Date('2026-10-23T10:00:00Z'));

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    obraSocialRepo = new ObraSocialRepositoryEnMemoria();
    validador = new ValidadorDeCoberturaFalso(obraSocialRepo);
    handler = new ValidarCoberturaHandler(validador, cuentaRepo, reloj);
  });

  it('debería aprobar la cobertura de una obra social válida y aplicar el porcentaje a la cuenta si se indica', async () => {
    const cuenta = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-1',
    });
    await cuentaRepo.guardar(cuenta);

    const res = await handler.ejecutar({
      pacienteId: 'pac-1',
      codigoObraSocial: 'OSDE',
      numeroAfiliado: '123456789',
      cuentaId: cuenta.id,
    });

    expect(res.aprobada).toBe(true);
    expect(res.porcentajeCobertura).toBe(80);
    expect(res.cuentaActualizada).toBe(true);

    const cuentaActualizada = await cuentaRepo.buscarPorId(cuenta.id);
    expect(cuentaActualizada!.coberturaValidada).toBe(true);
    expect(cuentaActualizada!.porcentajeCobertura).toBe(80);
  });

  it('debería rechazar si el afiliado es inválido o figura rechazado', async () => {
    const res = await handler.ejecutar({
      pacienteId: 'pac-1',
      codigoObraSocial: 'OSDE',
      numeroAfiliado: 'RECHAZADO-01',
    });

    expect(res.aprobada).toBe(false);
    expect(res.porcentajeCobertura).toBe(0);
    expect(res.motivoRechazo).toBeDefined();
  });
});

