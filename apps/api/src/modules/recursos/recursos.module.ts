import { Module } from '@nestjs/common';
import { CamasController } from './api/camas.controller';
import { InternacionesController } from './api/internaciones.controller';
import { InsumosController } from './api/insumos.controller';
import { CambiarEstadoCamaHandler } from './application/cambiar-estado-cama/cambiar-estado-cama.handler';
import { DarDeAltaHandler } from './application/dar-de-alta/dar-de-alta.handler';
import { DescontarInsumoAlAdministrarMedicacionHandler } from './application/event-handlers/descontar-insumo-al-administrar-medicacion.handler';
import { DescontarInsumoPorEventoHandler } from './application/descontar-insumo-evento/descontar-insumo-evento.handler';
import { InternarPacienteHandler } from './application/internar-paciente/internar-paciente.handler';
import { ListarInsumosHandler } from './application/listar-insumos/listar-insumos.handler';
import { ObtenerMapaCamasHandler } from './application/obtener-mapa-camas/obtener-mapa-camas.handler';
import {
  CAMA_REPOSITORY,
  EVENTOS_PROCESADOS_REPOSITORY,
  HABITACION_REPOSITORY,
  INSUMO_REPOSITORY,
  INTERNACION_REPOSITORY,
} from './application/ports/tokens';
import { RegistrarIngresoInsumoHandler } from './application/registrar-ingreso-insumo/registrar-ingreso-insumo.handler';
import { CamaRepositoryPrisma } from './infrastructure/cama.repository.prisma';
import { EventosProcesadosRepositoryPrisma } from './infrastructure/eventos-procesados.repository.prisma';
import { HabitacionRepositoryPrisma } from './infrastructure/habitacion.repository.prisma';
import { InsumoRepositoryPrisma } from './infrastructure/insumo.repository.prisma';
import { InternacionRepositoryPrisma } from './infrastructure/internacion.repository.prisma';

/**
 * Gestión de Recursos y Camas (Operaciones).
 * Fase 6 del ROADMAP.
 */
@Module({
  controllers: [
    CamasController,
    InternacionesController,
    InsumosController,
  ],
  providers: [
    // Casos de uso (Application)
    InternarPacienteHandler,
    DarDeAltaHandler,
    CambiarEstadoCamaHandler,
    ObtenerMapaCamasHandler,
    RegistrarIngresoInsumoHandler,
    DescontarInsumoPorEventoHandler,
    ListarInsumosHandler,
    // Event listener
    DescontarInsumoAlAdministrarMedicacionHandler,
    // Puertos -> Adaptadores de Infraestructura
    { provide: CAMA_REPOSITORY, useClass: CamaRepositoryPrisma },
    { provide: INTERNACION_REPOSITORY, useClass: InternacionRepositoryPrisma },
    { provide: INSUMO_REPOSITORY, useClass: InsumoRepositoryPrisma },
    { provide: HABITACION_REPOSITORY, useClass: HabitacionRepositoryPrisma },
    {
      provide: EVENTOS_PROCESADOS_REPOSITORY,
      useClass: EventosProcesadosRepositoryPrisma,
    },
  ],
  exports: [
    InternarPacienteHandler,
    DarDeAltaHandler,
    CambiarEstadoCamaHandler,
    ObtenerMapaCamasHandler,
    RegistrarIngresoInsumoHandler,
    DescontarInsumoPorEventoHandler,
    ListarInsumosHandler,
  ],
})
export class RecursosModule {}
