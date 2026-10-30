import { Module } from '@nestjs/common';
import { EnfermeriaController } from './api/enfermeria.controller';
import { AdministrarMedicacionHandler } from './application/administrar-medicacion/administrar-medicacion.handler';
import { OnPrescripcionCreadaHandler } from './application/event-handlers/on-prescripcion-creada.handler';
import { GenerarIndicacionesHandler } from './application/generar-indicaciones/generar-indicaciones.handler';
import { ListarIndicacionesHandler } from './application/listar-indicaciones/listar-indicaciones.handler';
import { ListarNotasEnfermeriaHandler } from './application/listar-notas-enfermeria/listar-notas-enfermeria.handler';
import { ListarSignosVitalesHandler } from './application/listar-signos-vitales/listar-signos-vitales.handler';
import { OmitirIndicacionHandler } from './application/omitir-indicacion/omitir-indicacion.handler';
import { RegistrarNotaEnfermeriaHandler } from './application/registrar-nota-enfermeria/registrar-nota-enfermeria.handler';
import { RegistrarSignosVitalesHandler } from './application/registrar-signos-vitales/registrar-signos-vitales.handler';
import { ADMINISTRACION_MEDICACION_REPOSITORY } from './domain/administracion-medicacion.repository';
import { INDICACION_REPOSITORY } from './domain/indicacion.repository';
import { NOTA_ENFERMERIA_REPOSITORY } from './domain/nota-enfermeria.repository';
import { SIGNOS_VITALES_REPOSITORY } from './domain/signos-vitales.repository';
import { AdministracionMedicacionRepositoryPrisma } from './infrastructure/administracion-medicacion.repository.prisma';
import { IndicacionRepositoryPrisma } from './infrastructure/indicacion.repository.prisma';
import { NotaEnfermeriaRepositoryPrisma } from './infrastructure/nota-enfermeria.repository.prisma';
import { SignosVitalesRepositoryPrisma } from './infrastructure/signos-vitales.repository.prisma';

/**
 * Atención y Enfermería (Inpatient Care). Ver README.md de esta carpeta.
 * Fase 5 del ROADMAP.
 */
@Module({
  controllers: [EnfermeriaController],
  providers: [
    // Casos de uso
    GenerarIndicacionesHandler,
    ListarIndicacionesHandler,
    AdministrarMedicacionHandler,
    OmitirIndicacionHandler,
    RegistrarSignosVitalesHandler,
    ListarSignosVitalesHandler,
    RegistrarNotaEnfermeriaHandler,
    ListarNotasEnfermeriaHandler,

    // Consumidores de eventos
    OnPrescripcionCreadaHandler,

    // Puertos -> Adaptadores Prisma
    {
      provide: INDICACION_REPOSITORY,
      useClass: IndicacionRepositoryPrisma,
    },
    {
      provide: ADMINISTRACION_MEDICACION_REPOSITORY,
      useClass: AdministracionMedicacionRepositoryPrisma,
    },
    {
      provide: SIGNOS_VITALES_REPOSITORY,
      useClass: SignosVitalesRepositoryPrisma,
    },
    {
      provide: NOTA_ENFERMERIA_REPOSITORY,
      useClass: NotaEnfermeriaRepositoryPrisma,
    },
  ],
  exports: [
    INDICACION_REPOSITORY,
    ADMINISTRACION_MEDICACION_REPOSITORY,
    SIGNOS_VITALES_REPOSITORY,
    NOTA_ENFERMERIA_REPOSITORY,
  ],
})
export class EnfermeriaModule {}
