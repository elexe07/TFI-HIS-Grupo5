import { randomUUID } from 'node:crypto';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADMIN, crearAppDePrueba, loguear } from './app-de-prueba';

describe('Admisión y Turnos (e2e)', () => {
  let app: INestApplication;
  let tokenAdmin: string;
  let tokenRecepcionista: string;
  let tokenEnfermero: string;
  const sufijo = Date.now();

  const recepcionista = {
    email: `recep-${sufijo}@his.local`,
    password: 'Clave1234!',
    nombre: 'Recepcionista Test',
    rol: 'ADMINISTRATIVO',
  };

  const enfermero = {
    email: `enfermero-adm-${sufijo}@his.local`,
    password: 'Clave1234!',
    nombre: 'Enfermero Triaje Test',
    rol: 'ENFERMERO',
  };

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await crearAppDePrueba();
    tokenAdmin = await loguear(app, ADMIN.email, ADMIN.password);

    // Crear usuarios para pruebas
    await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(recepcionista)
      .expect(201);

    await http()
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(enfermero)
      .expect(201);

    tokenRecepcionista = await loguear(app, recepcionista.email, recepcionista.password);
    tokenEnfermero = await loguear(app, enfermero.email, enfermero.password);
  });

  afterAll(() => app.close());

  describe('Control de acceso', () => {
    it('sin token rechaza con 401', async () => {
      await http().get('/api/pacientes').expect(401);
      await http().get('/api/turnos').expect(401);
      await http().get('/api/guardia/cola').expect(401);
    });
  });

  describe('Flujo completo de Admisión (ADM-01 a ADM-07)', () => {
    let pacienteId: string;
    let medicoId: string;
    let turnoId: string;
    const docNumero = `${Math.floor(10000000 + Math.random() * 90000000)}`;

    it('ADM-01: Registrar un nuevo paciente', async () => {
      const res = await http()
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          tipoDocumento: 'DNI',
          numeroDocumento: docNumero,
          nombre: 'Carlos',
          apellido: 'González',
          fechaNacimiento: '1988-06-12',
          sexo: 'M',
          telefono: '1144332211',
          email: 'carlos.gonzalez@test.local',
          obraSocialCodigo: 'OSDE',
          numeroAfiliado: 'OSDE-987654',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.numeroDocumento).toBe(docNumero);
      expect(res.body.nombre).toBe('Carlos');
      expect(res.body.apellido).toBe('González');
      pacienteId = res.body.id;
    });

    it('ADM-01: Documento duplicado falla con 409 Conflict', async () => {
      await http()
        .post('/api/pacientes')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          tipoDocumento: 'DNI',
          numeroDocumento: docNumero,
          nombre: 'Otro',
          apellido: 'Mismo Documento',
          fechaNacimiento: '1990-01-01',
          sexo: 'M',
        })
        .expect(409);
    });

    it('ADM-02: Buscar paciente por documento y por apellido', async () => {
      const resDoc = await http()
        .get(`/api/pacientes?documento=${docNumero}`)
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .expect(200);

      expect(resDoc.body).toHaveLength(1);
      expect(resDoc.body[0].id).toBe(pacienteId);

      const resApe = await http()
        .get('/api/pacientes?apellido=González')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .expect(200);

      expect(resApe.body.some((p: { id: string }) => p.id === pacienteId)).toBe(true);
    });

    it('Registrar un médico para atención', async () => {
      const matricula = `MN-${Math.floor(10000 + Math.random() * 90000)}`;
      const res = await http()
        .post('/api/medicos')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          usuarioId: randomUUID(),
          matricula,
          nombre: 'Sofía',
          apellido: 'Martínez',
          especialidad: 'Traumatología',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      medicoId = res.body.id;
    });

    it('ADM-03: Definir agenda médica semanal sin solapamientos', async () => {
      const res = await http()
        .post(`/api/medicos/${medicoId}/agenda`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          franjas: [
            { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
            { diaSemana: 3, horaInicio: '14:00', horaFin: '18:00', duracionTurnoMin: 30 },
          ],
        })
        .expect(201);

      expect(res.body.medicoId).toBe(medicoId);
      expect(res.body.franjas).toHaveLength(2);
    });

    it('ADM-03: Franjas solapadas en el mismo día falla con 409', async () => {
      await http()
        .post(`/api/medicos/${medicoId}/agenda`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          franjas: [
            { diaSemana: 1, horaInicio: '08:00', horaFin: '11:00', duracionTurnoMin: 30 },
            { diaSemana: 1, horaInicio: '10:00', horaFin: '13:00', duracionTurnoMin: 30 },
          ],
        })
        .expect(409);
    });

    it('ADM-04: Reservar turno dentro de la agenda', async () => {
      // 2026-11-09 es Lunes (día 1)
      const res = await http()
        .post('/api/turnos')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          pacienteId,
          medicoId,
          inicio: '2026-11-09T09:00:00.000Z',
          fin: '2026-11-09T09:30:00.000Z',
          motivoConsulta: 'Dolor en rodilla derecha',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.estado).toBe('RESERVADO');
      turnoId = res.body.id;
    });

    it('ADM-04: Franja ocupada falla con 409', async () => {
      await http()
        .post('/api/turnos')
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .send({
          pacienteId,
          medicoId,
          inicio: '2026-11-09T09:00:00.000Z',
          fin: '2026-11-09T09:30:00.000Z',
        })
        .expect(409);
    });

    it('ADM-05: Cancelar turno reservado', async () => {
      const res = await http()
        .delete(`/api/turnos/${turnoId}`)
        .set('Authorization', `Bearer ${tokenRecepcionista}`)
        .expect(200);

      expect(res.body.estado).toBe('CANCELADO');
    });

    it('ADM-06: Registrar triaje de guardia', async () => {
      const res = await http()
        .post('/api/triajes')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .send({
          pacienteId,
          nivel: 'NARANJA',
          motivo: 'Dificultad respiratoria moderada',
        })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.nivel).toBe('NARANJA');
      expect(res.body.estado).toBe('EN_ESPERA');
    });

    it('ADM-07: Consultar cola de guardia ordenada', async () => {
      const res = await http()
        .get('/api/guardia/cola')
        .set('Authorization', `Bearer ${tokenEnfermero}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.some((t: { pacienteId: string }) => t.pacienteId === pacienteId)).toBe(true);
    });
  });
});
