import { RelojFijo } from '../../../../building-blocks/testing';
import { EvolucionRegistrada } from '../../../hce/public';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria, TarifaRepositoryEnMemoria } from '../../testing';
import { AplicarCargoConsultaHandler } from './aplicar-cargo-consulta.handler';

describe('AplicarCargoConsultaHandler', () => {
  let handler: AplicarCargoConsultaHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  let tarifaRepo: TarifaRepositoryEnMemoria;
  const reloj = new RelojFijo(new Date('2026-10-23T11:00:00Z'));

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    tarifaRepo = new TarifaRepositoryEnMemoria();
    handler = new AplicarCargoConsultaHandler(cuentaRepo, tarifaRepo, reloj);
  });

  it('debería abrir cuenta tipo CONSULTA y aplicar el cargo según la tarifa vigente', async () => {
    const evento = new EvolucionRegistrada({
      evolucionId: 'evo-1',
      pacienteId: 'pac-1',
      medicoId: 'med-1',
      turnoId: 'turno-1',
    });

    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.CONSULTA, 'turno-1');
    expect(cuenta).not.toBeNull();
    expect(cuenta!.cargos).toHaveLength(1);
    const primerCargo = cuenta!.cargos[0]!;
    expect(primerCargo.concepto).toBe(ConceptoCargo.CONSULTA);
    expect(primerCargo.montoUnitario).toBe(15000); // Tarifa seed
    expect(cuenta!.calcularTotalBruto()).toBe(15000);
  });

  it('debería ser idempotente si el mismo evento se despacha dos veces', async () => {
    const evento = new EvolucionRegistrada({
      evolucionId: 'evo-1',
      pacienteId: 'pac-1',
      medicoId: 'med-1',
      turnoId: 'turno-1',
    });

    await handler.manejar(evento);
    await handler.manejar(evento);

    const cuenta = await cuentaRepo.buscarPorTipoYReferencia(TipoCuenta.CONSULTA, 'turno-1');
    expect(cuenta!.cargos).toHaveLength(1);
  });
});
