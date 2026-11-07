import { Module } from '@nestjs/common';
import { HceController } from './api/hce.controller';
import { AbrirHistoriaHandler } from './application/abrir-historia/abrir-historia.handler';
import { ConsultarHistoriaHandler } from './application/consultar-historia/consultar-historia.handler';
import { CrearPrescripcionHandler } from './application/crear-prescripcion/crear-prescripcion.handler';
import { AbrirHistoriaAlRegistrarPacienteHandler } from './application/event-handlers/abrir-historia-al-registrar-paciente.handler';
import { RegistrarAlergiaHandler } from './application/registrar-alergia/registrar-alergia.handler';
import { RegistrarAntecedenteHandler } from './application/registrar-antecedente/registrar-antecedente.handler';
import { RegistrarEstudioHandler } from './application/registrar-estudio/registrar-estudio.handler';
import { RegistrarEvolucionHandler } from './application/registrar-evolucion/registrar-evolucion.handler';
import { HISTORIA_CLINICA_REPOSITORY } from './domain/historia-clinica.repository';
import { HistoriaClinicaRepositoryPrisma } from './infrastructure/historia-clinica.repository.prisma';

@Module({
  controllers: [HceController],
  providers: [
    {
      provide: HISTORIA_CLINICA_REPOSITORY,
      useClass: HistoriaClinicaRepositoryPrisma,
    },
    AbrirHistoriaHandler,
    ConsultarHistoriaHandler,
    RegistrarEvolucionHandler,
    RegistrarAlergiaHandler,
    RegistrarAntecedenteHandler,
    CrearPrescripcionHandler,
    RegistrarEstudioHandler,
    AbrirHistoriaAlRegistrarPacienteHandler,
  ],
  exports: [HISTORIA_CLINICA_REPOSITORY, ConsultarHistoriaHandler],
})
export class HceModule {}
