import { ConsultorDeOcupacionFalso } from '../../testing';
import { ReporteOcupacionHandler } from './reporte-ocupacion.handler';

describe('ReporteOcupacionHandler', () => {
  it('debería retornar el resumen de ocupación hospitalaria', async () => {
    const consultor = new ConsultorDeOcupacionFalso({
      totalCamas: 50,
      ocupadas: 30,
      libres: 15,
      enLimpieza: 3,
      bloqueadas: 2,
      porcentajeOcupacion: 60,
    });
    const handler = new ReporteOcupacionHandler(consultor);

    const res = await handler.ejecutar();

    expect(res.totalCamas).toBe(50);
    expect(res.ocupadas).toBe(30);
    expect(res.porcentajeOcupacion).toBe(60);
  });
});

