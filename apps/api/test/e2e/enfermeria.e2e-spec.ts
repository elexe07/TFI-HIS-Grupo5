import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADMIN, crearAppDePrueba, loguear } from './app-de-prueba';

describe('Atención y Enfermería (e2e)', () => {
  let app: INestApplication;
  let tokenAdmin: string;
  let tokenEnfermero: string;
  const sufijo = Date.now();
  const enfermero = {
    email: `enfermero-${sufijo}@his.local`,
    password: 'Clave1234!',
    nombre: 'Enfermero Test',
    rol: 'ENFERMERO',
  };

  const pacienteId = randomUUID();
  const internacionId = randomUUID();
  const prescripcionId = randomUUID();

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await crearAppDePrueba();
    tokenAdmin = await loguear(app, ADMIN.email, ADMIN.password);

    // Crear un usuario con rol ENFERMERO
    await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(enfermero)
      .expect(201);

    tokenEnfermero = await loguear(app, enfermero.email, enfermero.password);
  });

  afterAll(() => app.close());

  describe('Control de acceso', () => {
    it('sin token rechaza con 401', async () => {
      await http().get('/api/enfermeria/indicaciones').expect(401);
    });
  });

  describe('Flujo de Indicaciones y Administración de Medicación', () => {
    let indicacionParaAdministrarId: string;
    let indicacionParaOmitirId: string;

    it('genera indicaciones a partir de prescripción (ENF-01)', async () => {
      const res = await http()
        .post('/api/enfermeria/indicaciones/generar')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({
          prescripcionId,
          pacienteId,
          internacionId,
          medicamento: 'Amoxicilina',
          dosis: '500 mg',
          frecuenciaHoras: 8,
          duracionDias: 1,
          inicioEn: '2026-10-23T08:00:00.000Z',
        })
        .expect(201);

      expect(res.body.generadas).toBe(3);
    });

    it('lista las indicaciones generadas (ENF-06)', async () => {
      const res = await http()
        .get(`/api/enfermeria/indicaciones?pacienteId=${pacienteId}`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(3);

      indicacionParaAdministrarId = res.body[0].id;
      indicacionParaOmitirId = res.body[1].id;
    });

    it('administra la primera indicación pendiente (ENF-03)', async () => {
      const res = await http()
        .post(`/api/enfermeria/indicaciones/${indicacionParaAdministrarId}/administrar`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(201);

      expect(res.body.indicacionId).toBe(indicacionParaAdministrarId);
      expect(res.body.medicamento).toBe('Amoxicilina 500 mg');

      // Intentar administrar nuevamente debe fallar con 409 Conflicto
      await http()
        .post(`/api/enfermeria/indicaciones/${indicacionParaAdministrarId}/administrar`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(409);
    });

    it('omite la segunda indicación pendiente con motivo (ENF-04)', async () => {
      const res = await http()
        .post(`/api/enfermeria/indicaciones/${indicacionParaOmitirId}/omitir`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({ motivo: 'Paciente dormido, se posterga administración' })
        .expect(200);

      expect(res.body.estado).toBe('OMITIDA');
      expect(res.body.motivoOmision).toBe('Paciente dormido, se posterga administración');
    });
  });

  describe('Control de Signos Vitales (ENF-02)', () => {
    it('registra y lista los signos vitales dentro de rango', async () => {
      const postRes = await http()
        .post('/api/enfermeria/signos-vitales')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({
          pacienteId,
          internacionId,
          temperatura: 36.7,
          presionSistolica: 120,
          presionDiastolica: 80,
          frecuenciaCardiaca: 72,
          saturacionO2: 98,
        })
        .expect(201);

      expect(postRes.body.pacienteId).toBe(pacienteId);
      expect(postRes.body.temperatura).toBe(36.7);

      const getRes = await http()
        .get(`/api/enfermeria/signos-vitales?pacienteId=${pacienteId}`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(200);

      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBeGreaterThanOrEqual(1);
      expect(getRes.body[0].temperatura).toBe(36.7);
    });

    it('falla con 400 si los signos vitales están fuera de rango permitido', async () => {
      await http()
        .post('/api/enfermeria/signos-vitales')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({
          pacienteId,
          temperatura: 48.0, // fuera de rango (30-45)
        })
        .expect(400);
    });
  });

  describe('Notas de Enfermería (ENF-05)', () => {
    it('registra y lista las notas de evolución de enfermería', async () => {
      const postRes = await http()
        .post('/api/enfermeria/notas')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({
          pacienteId,
          internacionId,
          texto: 'Paciente evoluciona favorablemente. Buena tolerancia oral.',
        })
        .expect(201);

      expect(postRes.body.texto).toBe(
        'Paciente evoluciona favorablemente. Buena tolerancia oral.',
      );

      const getRes = await http()
        .get(`/api/enfermeria/notas?pacienteId=${pacienteId}`)
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(200);

      expect(Array.isArray(getRes.body)).toBe(true);
      expect(getRes.body.length).toBeGreaterThanOrEqual(1);
      expect(getRes.body[0].texto).toBe(
        'Paciente evoluciona favorablemente. Buena tolerancia oral.',
      );
    });
  });
});
