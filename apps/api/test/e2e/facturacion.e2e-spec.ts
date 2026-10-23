import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADMIN, crearAppDePrueba, loguear } from './app-de-prueba';

describe('Facturación (e2e)', () => {
  let app: INestApplication;
  let tokenAdmin: string;

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await crearAppDePrueba();
    tokenAdmin = await loguear(app, ADMIN.email, ADMIN.password);
  });

  afterAll(() => app.close());

  describe('seguridad y permisos', () => {
    it('sin token → 401 TOKEN_INVALIDO', async () => {
      const res = await http().get('/api/cuentas').expect(401);
      expect(res.body).toMatchObject({ codigo: 'TOKEN_INVALIDO' });
    });

    it('GET /api/reportes/facturacion sin token → 401', async () => {
      await http()
        .get('/api/reportes/facturacion?desde=2026-10-01T00:00:00Z&hasta=2026-10-31T23:59:59Z')
        .expect(401);
    });
  });

  describe('validar cobertura (FAC-04)', () => {
    it('valida cobertura OSDE correctamente con token de administrador', async () => {
      const res = await http()
        .post('/api/cobertura/validar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          pacienteId: '00000000-0000-0000-0000-000000000001',
          codigoObraSocial: 'OSDE',
          numeroAfiliado: '123456789',
        })
        .expect(200);

      expect(res.body).toMatchObject({
        aprobada: true,
        porcentajeCobertura: 80,
      });
    });

    it('rechaza afiliado inhabilitado', async () => {
      const res = await http()
        .post('/api/cobertura/validar')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          pacienteId: '00000000-0000-0000-0000-000000000001',
          codigoObraSocial: 'OSDE',
          numeroAfiliado: 'RECHAZADO-01',
        })
        .expect(200);

      expect(res.body).toMatchObject({
        aprobada: false,
        porcentajeCobertura: 0,
      });
    });
  });

  describe('reportes (FAC-06, FAC-07)', () => {
    it('obtiene reporte de ocupación hospitalaria', async () => {
      const res = await http()
        .get('/api/reportes/ocupacion')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalCamas');
      expect(res.body).toHaveProperty('porcentajeOcupacion');
    });

    it('obtiene reporte de facturación por período', async () => {
      const res = await http()
        .get('/api/reportes/facturacion?desde=2026-10-01T00:00:00Z&hasta=2026-10-31T23:59:59Z')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body).toHaveProperty('granTotal');
      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });
  });
});

