import { ErrorDeValidacion } from '../../../../building-blocks/domain';
import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria, ReporteFacturacionRepositoryEnMemoria } from '../../testing';
import { ReporteFacturacionHandler } from './reporte-facturacion.handler';

describe('ReporteFacturacionHandler', () => {
  let handler: ReporteFacturacionHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;
  let reporteRepo: ReporteFacturacionRepositoryEnMemoria;

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    reporteRepo = new ReporteFacturacionRepositoryEnMemoria(cuentaRepo);
    handler = new ReporteFacturacionHandler(reporteRepo);
  });

  it('debería calcular el total acumulado por concepto en el rango de fechas', async () => {
    const fechaDentro = new Date('2026-10-15T10:00:00Z');
    const cuenta = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-1',
      ahora: fechaDentro,
    });
    cuenta.agregarCargo(
      Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.CONSULTA,
        descripcion: 'Consulta general',
        cantidad: 1,
        montoUnitario: 10000,
        origenEventoId: 'evt-1',
        createdAt: fechaDentro,
      }),
      fechaDentro,
    );
    cuenta.agregarCargo(
      Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Paracetamol',
        cantidad: 2,
        montoUnitario: 1500,
        origenEventoId: 'evt-2',
        createdAt: fechaDentro,
      }),
      fechaDentro,
    );
    await cuentaRepo.guardar(cuenta);

    const reporte = await handler.ejecutar({
      desde: new Date('2026-10-01T00:00:00Z'),
      hasta: new Date('2026-10-31T23:59:59Z'),
    });

    expect(reporte.granTotal).toBe(13000); // 10000 + 3000
    const consultaItem = reporte.items.find((i) => i.concepto === ConceptoCargo.CONSULTA);
    expect(consultaItem?.montoTotal).toBe(10000);
    const medItem = reporte.items.find((i) => i.concepto === ConceptoCargo.MEDICACION);
    expect(medItem?.montoTotal).toBe(3000);
  });

  it('debería fallar si la fecha hasta es menor a la fecha desde', async () => {
    await expect(
      handler.ejecutar({
        desde: new Date('2026-10-20'),
        hasta: new Date('2026-10-10'),
      }),
    ).rejects.toThrow(ErrorDeValidacion);
  });
});
