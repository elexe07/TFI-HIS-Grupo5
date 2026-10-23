import { RelojFijo } from '../../../../building-blocks/testing';
import { PacienteInternado } from '../../../recursos/public';
import { EstadoCuenta, TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria } from '../../testing';
import { AbrirCuentaInternacionHandler } from './abrir-cuenta-internacion.handler';

describe('AbrirCuentaInternacionHandler', () => {
  let handler: AbrirCuentaInternacionHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  const reloj = new RelojFijo(new Date('2026-10-23T10:00:00Z'));

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    handler = new AbrirCuentaInternacionHandler(cuentaRepo, reloj);
  });

  it('debería abrir la cuenta de internación en estado ABIERTA', async () => {
    const evento = new PacienteInternado({
      internacionId: 'int-123',
      pacienteId: 'pac-456',
      camaId: 'cama-1',
      ingresoEn: new Date('2026-10-23T08:00:00Z'),
    });

    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, 'int-123');
    expect(cuenta).not.toBeNull();
    expect(cuenta!.pacienteId).toBe('pac-456');
    expect(cuenta!.estado).toBe(EstadoCuenta.ABIERTA);
    expect(cuenta!.tipo).toBe(TipoCuenta.INTERNACION);
  });

  it('no debería duplicar la cuenta si el evento llega dos veces', async () => {
    const evento = new PacienteInternado({
      internacionId: 'int-123',
      pacienteId: 'pac-456',
      camaId: 'cama-1',
      ingresoEn: new Date('2026-10-23T08:00:00Z'),
    });

    await handler.manejar(evento);
    await handler.manejar(evento);

    const lista = await cuentaRepo.listarPorPaciente('pac-456');
    expect(lista).toHaveLength(1);
  });
});
