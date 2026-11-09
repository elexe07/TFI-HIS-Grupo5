import { PrismaClient, EstadoCama } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('--- Iniciando limpieza de registros transaccionales ---');

  // Enfermería
  const adminMed = await prisma.administracionMedicacion.deleteMany();
  console.log(`Administraciones de medicación eliminadas: ${adminMed.count}`);

  const notas = await prisma.notaEnfermeria.deleteMany();
  console.log(`Notas de enfermería eliminadas: ${notas.count}`);

  const signos = await prisma.signosVitales.deleteMany();
  console.log(`Signos vitales eliminados: ${signos.count}`);

  const indicaciones = await prisma.indicacion.deleteMany();
  console.log(`Indicaciones eliminadas: ${indicaciones.count}`);

  // Facturación
  const cargos = await prisma.cargo.deleteMany();
  console.log(`Cargos eliminados: ${cargos.count}`);

  const cuentas = await prisma.cuenta.deleteMany();
  console.log(`Cuentas eliminadas: ${cuentas.count}`);

  // Recursos / Internaciones
  const internaciones = await prisma.internacion.deleteMany();
  console.log(`Internaciones eliminadas: ${internaciones.count}`);

  const camasReset = await prisma.cama.updateMany({
    data: { estado: EstadoCama.LIBRE },
  });
  console.log(`Camas restablecidas a LIBRE: ${camasReset.count}`);

  // HCE
  const estudios = await prisma.estudio.deleteMany();
  console.log(`Estudios eliminados: ${estudios.count}`);

  const prescripciones = await prisma.prescripcion.deleteMany();
  console.log(`Prescripciones eliminadas: ${prescripciones.count}`);

  const antecedentes = await prisma.antecedenteFamiliar.deleteMany();
  console.log(`Antecedentes familiares eliminados: ${antecedentes.count}`);

  const alergias = await prisma.alergia.deleteMany();
  console.log(`Alergias eliminadas: ${alergias.count}`);

  const evoluciones = await prisma.evolucion.deleteMany();
  console.log(`Evoluciones eliminadas: ${evoluciones.count}`);

  const historias = await prisma.historiaClinica.deleteMany();
  console.log(`Historias clínicas eliminadas: ${historias.count}`);

  // Admisión
  const triajes = await prisma.triaje.deleteMany();
  console.log(`Triajes eliminados: ${triajes.count}`);

  const turnos = await prisma.turno.deleteMany();
  console.log(`Turnos eliminados: ${turnos.count}`);

  const pacientes = await prisma.paciente.deleteMany();
  console.log(`Pacientes eliminados: ${pacientes.count}`);

  // Eventos procesados
  const eventos = await prisma.eventoProcesado.deleteMany();
  console.log(`Eventos procesados eliminados: ${eventos.count}`);

  console.log('--- Limpieza completada con éxito ---');
}

main()
  .catch((error: unknown) => {
    console.error('Error al limpiar base de datos:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
