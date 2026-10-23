import { RelojFijo } from '../../../../building-blocks/testing';
import { PacienteDadoDeAlta } from '../../../recursos/public';
import { ConceptoCargo, EstadoCuenta, TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria, TarifaRepositoryEnMemoria } from '../../testing';
import { CerrarCuentaInternacionHandler } from './cerrar-cuenta-internacion.handler';

describe('CerrarCuentaInternacionHandler', () => {
  let handler: CerrarCuentaInternacionHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  let tarifaRepo: TarifaRepositoryEnMemoria;
  const reloj = new RelojFijo(new Date('2026-10-25T10:00:00Z'));

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    tarifaRepo = new TarifaRepositoryEnMemoria();
    handler = new CerrarCuentaInternacionHandler(cuentaRepo, tarifaRepo, reloj);
  });

  it('debería calcular los días de internación (mínimo 1), aplicar cargo DIA_CAMA y cerrar la cuenta', async () => {
    // Ingreso 2026-10-20, Alta 2026-10-23 (3 días)
    const evento = new PacienteDadoDeAlta({
      internacionId: 'int-777',
      pacienteId: 'pac-1',
      ingresoEn: new Date('2026-10-20T10:00:00Z'),
      egresoEn: new Date('2026-10-23T10:00:00Z'),
    });

    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, 'int-777');
    expect(cuenta).not.toBeNull();
    expect(cuenta!.estado).toBe(EstadoCuenta.CERRADA);
    expect(cuenta!.cargos).toHaveLength(1);
    const primerCargo = cuenta!.cargos[0]!;
    expect(primerCargo.concepto).toBe(ConceptoCargo.DIA_CAMA);
    expect(primerCargo.cantidad).toBe(3);
    expect(primerCargo.montoUnitario).toBe(45000); // Tarifa seed
    expect(cuenta!.calcularTotalBruto()).toBe(135000); // 3 * 45000
  });

  it('debería asignar mínimo 1 día si el alta ocurre el mismo día', async () => {
    const evento = new PacienteDadoDeAlta({
      internacionId: 'int-888',
      pacienteId: 'pac-1',
      ingresoEn: new Date('2026-10-23T08:00:00Z'),
      egresoEn: new Date('2026-10-23T12:00:00Z'),
    });

    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, 'int-888');
    const primerCargo = cuenta!.cargos[0]!;
    expect(primerCargo.cantidad).toBe(1);
    expect(cuenta!.calcularTotalBruto()).toBe(45000);
  });
});
