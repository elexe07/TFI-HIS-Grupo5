import { ReporteFacturacionHandler } from '../application/reportes/reporte-facturacion.handler';
import { ReporteOcupacionHandler } from '../application/reportes/reporte-ocupacion.handler';
import { ConsultorDeOcupacionFalso, ReporteFacturacionRepositoryEnMemoria } from '../testing';
import { ReportesController } from './reportes.controller';

describe('ReportesController', () => {
  let controller: ReportesController;

  beforeEach(() => {
    const reporteRepo = new ReporteFacturacionRepositoryEnMemoria();
    const consultorOcupacion = new ConsultorDeOcupacionFalso({
      totalCamas: 30,
      ocupadas: 15,
      libres: 10,
      enLimpieza: 3,
      bloqueadas: 2,
      porcentajeOcupacion: 50,
    });

    const reporteFacturacionHandler = new ReporteFacturacionHandler(reporteRepo);
    const reporteOcupacionHandler = new ReporteOcupacionHandler(consultorOcupacion);

    controller = new ReportesController(reporteFacturacionHandler, reporteOcupacionHandler);
  });

  it('debería retornar el reporte de ocupación', async () => {
    const res = await controller.obtenerReporteOcupacion();
    expect(res.totalCamas).toBe(30);
    expect(res.porcentajeOcupacion).toBe(50);
  });

  it('debería retornar el reporte de facturación por período', async () => {
    const res = await controller.obtenerReporteFacturacion({
      desde: '2026-10-01T00:00:00Z',
      hasta: '2026-10-31T23:59:59Z',
    });

    expect(res.granTotal).toBe(0);
    expect(res.items).toHaveLength(3);
  });
});
