import { randomUUID } from 'node:crypto';
import { ConceptoCargo, PrismaClient, Sexo, TipoDocumento } from '@prisma/client';
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
  {
    codigo: 'DEXA4',
    nombre: 'Dexametasona 4 mg (Inyectable)',
    medicamentoAsociado: 'Dexametasona Inyectable',
    stock: 150,
    minimo: 30,
  },
  {
    codigo: 'CURA_GASA',
    nombre: 'Curación con gasa',
    medicamentoAsociado: 'Curación con gasa',
    stock: 100,
    minimo: 20,
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

function hora(h: number, m: number): Date {
  return new Date(Date.UTC(1970, 0, 1, h, m, 0, 0));
}

async function sembrarAdmision(): Promise<void> {
  const rolMedico = await prisma.rol.findUniqueOrThrow({ where: { nombre: 'MEDICO' } });
  const passwordHash = await hash('Medico1234!', 10);

  // 1. Pacientes iniciales
  const pacientesSeed = [
    {
      tipoDocumento: TipoDocumento.DNI,
      numeroDocumento: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      fechaNacimiento: new Date('1990-05-15'),
      sexo: Sexo.M,
      telefono: '11-2345-6789',
      email: 'juan.perez@email.com',
      obraSocialCodigo: 'OSDE',
      numeroAfiliado: 'OSDE-123456',
    },
    {
      tipoDocumento: TipoDocumento.DNI,
      numeroDocumento: '23456789',
      nombre: 'María',
      apellido: 'López',
      fechaNacimiento: new Date('1985-08-20'),
      sexo: Sexo.F,
      telefono: '11-9876-5432',
      email: 'maria.lopez@email.com',
      obraSocialCodigo: 'PAMI',
      numeroAfiliado: 'PAMI-987654',
    },
  ];

  for (const p of pacientesSeed) {
    await prisma.paciente.upsert({
      where: {
        tipoDocumento_numeroDocumento: {
          tipoDocumento: p.tipoDocumento,
          numeroDocumento: p.numeroDocumento,
        },
      },
      update: {},
      create: { id: randomUUID(), ...p },
    });
  }

  // 2. Médicos y agendas iniciales
  const medicosSeed = [
    {
      email: 'dr.garcia@his.local',
      nombre: 'Martín',
      apellido: 'García',
      matricula: 'MN-44551',
      especialidad: 'Clínica Médica',
      franjas: [
        { diaSemana: 1, horaInicio: hora(8, 0), horaFin: hora(12, 0), duracionTurnoMin: 30 },
        { diaSemana: 3, horaInicio: hora(8, 0), horaFin: hora(12, 0), duracionTurnoMin: 30 },
        { diaSemana: 5, horaInicio: hora(8, 0), horaFin: hora(12, 0), duracionTurnoMin: 30 },
      ],
    },
    {
      email: 'dra.gomez@his.local',
      nombre: 'Laura',
      apellido: 'Gómez',
      matricula: 'MN-55662',
      especialidad: 'Pediatría',
      franjas: [
        { diaSemana: 2, horaInicio: hora(9, 0), horaFin: hora(13, 0), duracionTurnoMin: 30 },
        { diaSemana: 4, horaInicio: hora(9, 0), horaFin: hora(13, 0), duracionTurnoMin: 30 },
      ],
    },
    {
      email: 'dr.fernandez@his.local',
      nombre: 'Lucas',
      apellido: 'Fernández',
      matricula: 'MN-66773',
      especialidad: 'Traumatología',
      franjas: [
        { diaSemana: 1, horaInicio: hora(14, 0), horaFin: hora(18, 0), duracionTurnoMin: 30 },
        { diaSemana: 4, horaInicio: hora(14, 0), horaFin: hora(18, 0), duracionTurnoMin: 30 },
      ],
    },
  ];

  for (const m of medicosSeed) {
    const usuario = await prisma.usuario.upsert({
      where: { email: m.email.toLowerCase() },
      update: { activo: true },
      create: {
        id: randomUUID(),
        email: m.email.toLowerCase(),
        nombre: `${m.nombre} ${m.apellido}`,
        passwordHash,
        rolId: rolMedico.id,
      },
    });

    const medico = await prisma.medico.upsert({
      where: { matricula: m.matricula },
      update: { nombre: m.nombre, apellido: m.apellido, especialidad: m.especialidad },
      create: {
        id: randomUUID(),
        usuarioId: usuario.id,
        matricula: m.matricula,
        nombre: m.nombre,
        apellido: m.apellido,
        especialidad: m.especialidad,
      },
    });

    // Sembrar franjas de agenda
    await prisma.agenda.deleteMany({ where: { medicoId: medico.id } });
    await prisma.agenda.createMany({
      data: m.franjas.map((f) => ({
        id: randomUUID(),
        medicoId: medico.id,
        diaSemana: f.diaSemana,
        horaInicio: f.horaInicio,
        horaFin: f.horaFin,
        duracionTurnoMin: f.duracionTurnoMin,
      })),
    });
  }
}

async function main(): Promise<void> {
  await sembrarIam();
  await sembrarFacturacion();
  await sembrarRecursos();
  await sembrarAdmision();
  console.log(
    `Seed OK: roles y permisos, admin ${ADMIN.email}, obras sociales, tarifas, habitaciones, camas, insumos, médicos y pacientes.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
