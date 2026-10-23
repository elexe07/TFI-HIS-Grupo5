import { PrismaService } from '../../src/building-blocks/infrastructure/prisma/prisma.service';

/**
 * Test de integración de referencia: necesita Postgres migrado.
 *   pnpm db:up && pnpm db:migrate && pnpm test:integration
 * Cada módulo agrega acá sus tests de repositorio Prisma (`<modulo>.repository.int-spec.ts`).
 */
describe('Base de datos', () => {
  const prisma = new PrismaService();

  beforeAll(() => prisma.$connect());
  afterAll(() => prisma.$disconnect());

  it('responde', async () => {
    const filas = await prisma.$queryRaw<{ uno: number }[]>`SELECT 1 AS uno`;
    expect(filas[0]?.uno).toBe(1);
  });

  it('tiene un schema por módulo', async () => {
    const filas = await prisma.$queryRaw<{ schema_name: string }[]>`
      SELECT schema_name FROM information_schema.schemata
      WHERE schema_name IN ('iam','admision','hce','enfermeria','recursos','facturacion')
      ORDER BY schema_name`;
    expect(filas.map((f) => f.schema_name)).toEqual([
      'admision',
      'enfermeria',
      'facturacion',
      'hce',
      'iam',
      'recursos',
    ]);
  });

  it('tiene los 5 roles del sistema (seed)', async () => {
    const roles = await prisma.rol.findMany({ orderBy: { nombre: 'asc' } });
    expect(roles.map((r) => r.nombre)).toEqual([
      'ADMINISTRADOR',
      'ENFERMERO',
      'MEDICO',
      'PACIENTE',
      'RECEPCIONISTA',
    ]);
  });
});
