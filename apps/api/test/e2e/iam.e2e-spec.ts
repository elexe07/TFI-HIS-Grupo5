import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ADMIN, crearAppDePrueba, loguear } from './app-de-prueba';

/**
 * Flujo completo de IAM por HTTP: login del admin del seed, alta de usuarios con roles,
 * endpoints protegidos (401 / 403) y cambio de rol.
 */
describe('IAM (e2e)', () => {
  let app: INestApplication;
  let tokenAdmin: string;
  const sufijo = Date.now();
  const recepcionista = { email: `recep-${sufijo}@his.local`, password: 'Clave1234' };

  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await crearAppDePrueba();
    tokenAdmin = await loguear(app, ADMIN.email, ADMIN.password);
  });

  afterAll(() => app.close());

  describe('login', () => {
    it('el admin del seed entra y su token trae rol y permisos', async () => {
      const res = await http()
        .post('/api/auth/login')
        .send({ email: ADMIN.email, password: ADMIN.password })
        .expect(200);

      expect(res.body.usuario).toMatchObject({ email: ADMIN.email, rol: 'ADMINISTRADOR' });
      expect(res.body.usuario.permisos).toContain('usuarios:gestionar');
    });

    it('rechaza credenciales inválidas con 401 sin decir cuál falló', async () => {
      const res = await http()
        .post('/api/auth/login')
        .send({ email: ADMIN.email, password: 'incorrecta' })
        .expect(401);
      expect(res.body).toMatchObject({ codigo: 'CREDENCIALES_INVALIDAS' });
    });

    it('GET /auth/me devuelve el usuario del token', async () => {
      const res = await http()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body).toMatchObject({ email: ADMIN.email, rol: 'ADMINISTRADOR' });
    });
  });

  describe('endpoints protegidos', () => {
    it('sin token → 401 TOKEN_INVALIDO', async () => {
      const res = await http().get('/api/usuarios').expect(401);
      expect(res.body).toMatchObject({ codigo: 'TOKEN_INVALIDO' });
    });

    it('con token basura → 401', async () => {
      await http().get('/api/usuarios').set('Authorization', 'Bearer abc.def.ghi').expect(401);
    });

    it('el admin registra una recepcionista', async () => {
      const res = await http()
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...recepcionista, nombre: 'Rita', rol: 'RECEPCIONISTA' })
        .expect(201);
      expect(res.body).toMatchObject({ email: recepcionista.email, rol: 'RECEPCIONISTA' });
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('email repetido → 409 EMAIL_YA_REGISTRADO', async () => {
      const res = await http()
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...recepcionista, nombre: 'Otra', rol: 'MEDICO' })
        .expect(409);
      expect(res.body).toMatchObject({ codigo: 'EMAIL_YA_REGISTRADO' });
    });

    it('password débil → 400 PASSWORD_DEBIL', async () => {
      const res = await http()
        .post('/api/usuarios')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ email: `x-${sufijo}@his.local`, nombre: 'X', password: '1234', rol: 'MEDICO' })
        .expect(400);
      expect(res.body).toMatchObject({ codigo: 'PASSWORD_DEBIL' });
    });

    it('la recepcionista entra pero no puede gestionar usuarios → 403 PERMISO_FALTANTE', async () => {
      const token = await loguear(app, recepcionista.email, recepcionista.password);

      await http().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      const res = await http()
        .get('/api/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
      expect(res.body).toMatchObject({ codigo: 'PERMISO_FALTANTE' });
    });
  });

  describe('asignar rol', () => {
    it('el admin cambia el rol de la recepcionista a ENFERMERO', async () => {
      const lista = await http().get('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
      const rita = lista.body.find((u: { email: string }) => u.email === recepcionista.email);

      const res = await http()
        .patch(`/api/usuarios/${rita.id}/rol`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ rol: 'ENFERMERO' })
        .expect(200);
      expect(res.body.rol).toBe('ENFERMERO');

      const sesion = await http().post('/api/auth/login').send(recepcionista).expect(200);
      expect(sesion.body.usuario.permisos).toContain('triaje:registrar');
    });

    it('no deja degradar al último administrador activo → 409', async () => {
      const lista = await http().get('/api/usuarios').set('Authorization', `Bearer ${tokenAdmin}`);
      const admins = lista.body.filter(
        (u: { rol: string; activo: boolean }) => u.rol === 'ADMINISTRADOR' && u.activo,
      );
      if (admins.length !== 1) return; // base local con más admins: la regla se cubre en el unit test

      const res = await http()
        .patch(`/api/usuarios/${admins[0].id}/rol`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ rol: 'MEDICO' })
        .expect(409);
      expect(res.body).toMatchObject({ codigo: 'ULTIMO_ADMINISTRADOR' });
    });

    it('id que no es uuid → 400; uuid inexistente → 404', async () => {
      await http()
        .patch('/api/usuarios/no-uuid/rol')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ rol: 'MEDICO' })
        .expect(400);
      await http()
        .patch('/api/usuarios/00000000-0000-4000-8000-000000000000/rol')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ rol: 'MEDICO' })
        .expect(404);
    });
  });
});
