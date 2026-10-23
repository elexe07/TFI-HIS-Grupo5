import { randomUUID } from 'node:crypto';
import { ConceptoCargo, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { MATRIZ_PERMISOS, PERMISOS, ROLES } from '../src/modules/iam/domain/permisos';

/**
 * Datos iniciales. Idempotente: se puede correr todas las veces que haga falta.
 *   pnpm db:seed
 *
 * Cada módulo agrega acá lo que necesita para arrancar (catálogos, no datos de prueba).
 * Datos de prueba para desarrollo → prisma/seed.dev.ts (lo crea quien lo necesite).
 */
const prisma = new PrismaClient();

/** Administrador inicial. Se puede cambiar por variables de entorno (ver .env.example). */
const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? 'admin@his.local',
  password: process.env.ADMIN_PASSWORD ?? 'Admin1234!',
};

const OBRAS_SOCIALES = [
  { codigo: 'PARTICULAR', nombre: 'Particular (sin cobertura)', porcentajeCobertura: 0 },
  { codigo: 'OSDE', nombre: 'OSDE', porcentajeCobertura: 80 },
  { codigo: 'PAMI', nombre: 'PAMI', porcentajeCobertura: 100 },
] as const;

const TARIFAS: { concepto: ConceptoCargo; monto: number }[] = [
  { concepto: ConceptoCargo.CONSULTA, monto: 15000 },
  { concepto: ConceptoCargo.MEDICACION, monto: 2500 },
  { concepto: ConceptoCargo.DIA_CAMA, monto: 60000 },
];

const HABITACIONES = [
  { sector: 'Guardia', numero: '1', camas: ['G-1A', 'G-1B'] },
  { sector: 'Clínica Médica', numero: '101', camas: ['CM-101A', 'CM-101B'] },
  { sector: 'UTI', numero: '1', camas: ['UTI-1A', 'UTI-1B'] },
];

const INSUMOS = [
  {
    codigo: 'AMOX500',
    nombre: 'Amoxicilina 500 mg',
    medicamentoAsociado: 'Amoxicilina',
    stock: 200,
    minimo: 50,
  },
  {
    codigo: 'IBU400',
    nombre: 'Ibuprofeno 400 mg',
    medicamentoAsociado: 'Ibuprofeno',
    stock: 300,
    minimo: 50,
  },
  {
    codigo: 'PARA1G',
    nombre: 'Paracetamol 1 g',
    medicamentoAsociado: 'Paracetamol',
    stock: 300,
    minimo: 50,
  },
  { codigo: 'GASA', nombre: 'Gasa estéril', medicamentoAsociado: null, stock: 500, minimo: 100 },
  { codigo: 'JER5', nombre: 'Jeringa 5 ml', medicamentoAsociado: null, stock: 400, minimo: 100 },
];

/**
 * IAM: roles, permisos y la matriz rol × permiso salen de `src/modules/iam/domain/permisos.ts`.
 * Las asignaciones se reemplazan completas en cada corrida, así la base siempre refleja la matriz.
 */
async function sembrarIam(): Promise<void> {
  const permisoIdPorCodigo = new Map<string, string>();
  for (const codigo of Object.values(PERMISOS)) {
    const permiso = await prisma.permiso.upsert({
      where: { codigo },
      update: {},
      create: { id: randomUUID(), codigo },
    });
    permisoIdPorCodigo.set(codigo, permiso.id);
  }

  for (const nombre of ROLES) {
    const rol = await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { id: randomUUID(), nombre },
    });
    await prisma.rolPermiso.deleteMany({ where: { rolId: rol.id } });
    await prisma.rolPermiso.createMany({
      data: MATRIZ_PERMISOS[nombre].map((codigo) => ({
        rolId: rol.id,
        permisoId: permisoIdPorCodigo.get(codigo)!,
      })),
    });
  }

  await sembrarAdministrador();
}

/** Administrador inicial: si ya existe, se le vuelve a aplicar la contraseña del .env. */
async function sembrarAdministrador(): Promise<void> {
  const rolAdmin = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'ADMINISTRADOR' } });
  const passwordHash = await hash(ADMIN.password, 10);
  await prisma.usuario.upsert({
    where: { email: ADMIN.email.toLowerCase() },
    update: { passwordHash, rolId: rolAdmin.id, activo: true },
    create: {
      id: randomUUID(),
      email: ADMIN.email.toLowerCase(),
      nombre: 'Administrador',
      passwordHash,
      rolId: rolAdmin.id,
    },
  });
}

async function sembrarFacturacion(): Promise<void> {
  for (const os of OBRAS_SOCIALES) {
    await prisma.obraSocial.upsert({
      where: { codigo: os.codigo },
      update: { nombre: os.nombre, porcentajeCobertura: os.porcentajeCobertura },
      create: { id: randomUUID(), ...os },
    });
  }
  for (const tarifa of TARIFAS) {
    await prisma.tarifa.upsert({
      where: { concepto: tarifa.concepto },
      update: {},
      create: { id: randomUUID(), ...tarifa },
    });
  }
}

async function sembrarRecursos(): Promise<void> {
  for (const h of HABITACIONES) {
    const habitacion = await prisma.habitacion.upsert({
      where: { sector_numero: { sector: h.sector, numero: h.numero } },
      update: {},
      create: { id: randomUUID(), sector: h.sector, numero: h.numero },
    });
    for (const codigo of h.camas) {
      await prisma.cama.upsert({
        where: { codigo },
        update: {},
        create: { id: randomUUID(), codigo, habitacionId: habitacion.id },
      });
    }
  }
  for (const i of INSUMOS) {
    await prisma.insumo.upsert({
      where: { codigo: i.codigo },
      update: {},
      create: {
        id: randomUUID(),
        codigo: i.codigo,
        nombre: i.nombre,
        medicamentoAsociado: i.medicamentoAsociado,
        stockActual: i.stock,
        stockMinimo: i.minimo,
      },
    });
  }
}

async function main(): Promise<void> {
  await sembrarIam();
  await sembrarFacturacion();
  await sembrarRecursos();
  console.log(
    `Seed OK: roles y permisos, admin ${ADMIN.email}, obras sociales, tarifas, habitaciones, camas e insumos.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
