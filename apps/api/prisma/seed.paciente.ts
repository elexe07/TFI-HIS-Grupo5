import { randomUUID } from 'node:crypto';
import { PrismaClient, TipoDocumento, Sexo } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Inserta un paciente de prueba para desarrollo.
 * Se puede correr con: pnpm ts-node --transpile-only prisma/seed.paciente.ts
 * O desde la raíz: pnpm --filter @his/api ts-node --transpile-only prisma/seed.paciente.ts
 */
async function main(): Promise<void> {
  // Verificar si ya existe un paciente con este documento
  const existente = await prisma.paciente.findUnique({
    where: {
      tipoDocumento_numeroDocumento: {
        tipoDocumento: TipoDocumento.DNI,
        numeroDocumento: '12345678',
      },
    },
  });

  if (existente) {
    console.log(
      `Paciente de prueba ya existe: ${existente.nombre} ${existente.apellido} (${existente.id})`,
    );
    return;
  }

  // Obtener una obra social (OSDE) para el paciente
  const obraSocial = await prisma.obraSocial.findUnique({
    where: { codigo: 'OSDE' },
  });

  const paciente = await prisma.paciente.create({
    data: {
      id: randomUUID(),
      tipoDocumento: TipoDocumento.DNI,
      numeroDocumento: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
      fechaNacimiento: new Date('1990-05-15'),
      sexo: Sexo.M,
      telefono: '11-2345-6789',
      email: 'juan.perez@email.com',
      obraSocialCodigo: obraSocial?.codigo ?? 'PARTICULAR',
      numeroAfiliado: 'OSDE-123456',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('Paciente de prueba creado:', {
    id: paciente.id,
    nombre: `${paciente.nombre} ${paciente.apellido}`,
    documento: `${paciente.tipoDocumento} ${paciente.numeroDocumento}`,
    obraSocial: paciente.obraSocialCodigo,
    numeroAfiliado: paciente.numeroAfiliado,
  });
}

main()
  .catch((error: unknown) => {
    console.error('Error al crear paciente:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
