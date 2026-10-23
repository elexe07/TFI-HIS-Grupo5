import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { crearAppDePrueba } from './app-de-prueba';

/**
 * End-to-end de referencia: levanta toda la app (necesita Postgres) y pega por HTTP.
 * `health` y `ejemplo` son @Publico(); el flujo con login está en iam.e2e-spec.ts.
 * En la Fase 8 acá va el flujo demo completo.
 */
describe('API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await crearAppDePrueba();
  });

  afterAll(() => app.close());

  it('GET /api/health responde ok con la base conectada', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'ok' });
  });

  it('POST /api/ejemplo/saludos crea y GET lo lista', async () => {
    const creado = await request(app.getHttpServer())
      .post('/api/ejemplo/saludos')
      .send({ destinatario: 'Ana' })
      .expect(201);
    expect(creado.body).toMatchObject({ mensaje: 'Hola, Ana' });

    const lista = await request(app.getHttpServer()).get('/api/ejemplo/saludos').expect(200);
    expect(lista.body).toEqual(
      expect.arrayContaining([expect.objectContaining({ destinatario: 'Ana' })]),
    );
  });

  it('valida el body con class-validator (400)', async () => {
    await request(app.getHttpServer()).post('/api/ejemplo/saludos').send({}).expect(400);
  });

  it('traduce errores de dominio (400 con código)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/ejemplo/saludos')
      .send({ destinatario: '   ' })
      .expect(400);
    expect(res.body).toMatchObject({ codigo: 'NOMBRE_INVALIDO', tipo: 'VALIDACION' });
  });
});
