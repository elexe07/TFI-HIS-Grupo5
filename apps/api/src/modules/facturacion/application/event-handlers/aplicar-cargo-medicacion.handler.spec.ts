import { RelojFijo } from '../../../../building-blocks/testing';
import { MedicacionAdministrada } from '../../../enfermeria/public';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria, TarifaRepositoryEnMemoria } from '../../testing';
import { AplicarCargoMedicacionHandler } from './aplicar-cargo-medicacion.handler';

describe('AplicarCargoMedicacionHandler', () => {
  let handler: AplicarCargoMedicacionHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  let tarifaRepo: TarifaRepositoryEnMemoria;
  const reloj = new RelojFijo(new Date('2026-10-23T12:00:00Z'));

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    tarifaRepo = new TarifaRepositoryEnMemoria();
    handler = new AplicarCargoMedicacionHandler(cuentaRepo, tarifaRepo, reloj);
  });

  it('debería registrar el cargo por medicación en la cuenta de internación', async () => {
    const evento = new MedicacionAdministrada({
      administracionId: 'adm-1',
      pacienteId: 'pac-1',
      internacionId: 'int-1',
      medicamento: 'Amoxicilina 500mg',
    });

    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, 'int-1');
    expect(cuenta).not.toBeNull();
    expect(cuenta!.cargos).toHaveLength(1);
    const primerCargo = cuenta!.cargos[0]!;
    expect(primerCargo.concepto).toBe(ConceptoCargo.MEDICACION);
    expect(primerCargo.descripcion).toContain('Amoxicilina 500mg');
    expect(primerCargo.montoUnitario).toBe(5000); // Tarifa seed
  });

  it('debería ignorar la ejecución si el evento ya fue procesado', async () => {
    const evento = new MedicacionAdministrada({
      administracionId: 'adm-1',
      pacienteId: 'pac-1',
      internacionId: 'int-1',
      medicamento: 'Amoxicilina 500mg',
    });

    await handler.manejar(evento);
    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.INTERNACION, 'int-1');
    expect(cuenta!.cargos).toHaveLength(1);
  });
});
