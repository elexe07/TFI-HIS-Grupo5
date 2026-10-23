import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DomainErrorFilter } from '../../src/building-blocks/api/domain-error.filter';

/** Levanta la app igual que main.ts (prefijo, validación, filtro). Necesita Postgres migrado y seedeado. */
export async function crearAppDePrueba(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new DomainErrorFilter());
  await app.init();
  return app;
}

/** Credenciales del administrador que crea el seed (mismos defaults que prisma/seed.ts). */
export const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? 'admin@his.local',
  password: process.env.ADMIN_PASSWORD ?? 'Admin1234!',
};

/** Hace login y devuelve el token. Lo usan los e2e de todos los módulos. */
export async function loguear(app: INestApplication, email: string, password: string) {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email, password })
    .expect(200);
  return res.body.token as string;
}
