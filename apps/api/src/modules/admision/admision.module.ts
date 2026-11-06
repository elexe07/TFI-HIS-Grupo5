import { Module } from '@nestjs/common';
import { GuardiaController } from './api/guardia.controller';
import { MedicosController } from './api/medicos.controller';
import { PacientesController } from './api/pacientes.controller';
import { TriajesController } from './api/triajes.controller';
import { TurnosController } from './api/turnos.controller';
import { BuscarPacientePorIdHandler } from './application/buscar-paciente-por-id/buscar-paciente-por-id.handler';
import { BuscarPacientesHandler } from './application/buscar-pacientes/buscar-pacientes.handler';
import { CancelarTurnoHandler } from './application/cancelar-turno/cancelar-turno.handler';
import { DefinirAgendaHandler } from './application/definir-agenda/definir-agenda.handler';
import { ListarMedicosHandler } from './application/listar-medicos/listar-medicos.handler';
import { ListarTurnosHandler } from './application/listar-turnos/listar-turnos.handler';
import { ObtenerAgendaHandler } from './application/obtener-agenda/obtener-agenda.handler';
import { ObtenerColaGuardiaHandler } from './application/obtener-cola-guardia/obtener-cola-guardia.handler';
import { AGENDA_REPOSITORY } from './application/ports/tokens';
import { MEDICO_REPOSITORY } from './application/ports/tokens';
import { PACIENTE_REPOSITORY } from './application/ports/tokens';
import { TRIAJE_REPOSITORY } from './application/ports/tokens';
import { TURNO_REPOSITORY } from './application/ports/tokens';
import { RegistrarMedicoHandler } from './application/registrar-medico/registrar-medico.handler';
import { RegistrarPacienteHandler } from './application/registrar-paciente/registrar-paciente.handler';
import { RegistrarTriajeHandler } from './application/registrar-triaje/registrar-triaje.handler';
import { ReservarTurnoHandler } from './application/reservar-turno/reservar-turno.handler';
import { AgendaRepositoryPrisma } from './infrastructure/agenda.repository.prisma';
import { MedicoRepositoryPrisma } from './infrastructure/medico.repository.prisma';
import { PacienteRepositoryPrisma } from './infrastructure/paciente.repository.prisma';
import { TriajeRepositoryPrisma } from './infrastructure/triaje.repository.prisma';
import { TurnoRepositoryPrisma } from './infrastructure/turno.repository.prisma';

/**
 * Módulo 2: Admisión y Turnos (Front-Desk).
 * Manejo de pacientes, agendas médicas, reserva y cancelación de turnos, y triaje de guardia.
 */
@Module({
  controllers: [
    PacientesController,
    MedicosController,
    TurnosController,
    TriajesController,
    GuardiaController,
  ],
  providers: [
    // Casos de uso
    RegistrarPacienteHandler,
    BuscarPacientesHandler,
    BuscarPacientePorIdHandler,
    RegistrarMedicoHandler,
    ListarMedicosHandler,
    DefinirAgendaHandler,
    ObtenerAgendaHandler,
    ReservarTurnoHandler,
    CancelarTurnoHandler,
    ListarTurnosHandler,
    RegistrarTriajeHandler,
    ObtenerColaGuardiaHandler,

    // Puertos → Adaptadores Prisma
    { provide: PACIENTE_REPOSITORY, useClass: PacienteRepositoryPrisma },
    { provide: MEDICO_REPOSITORY, useClass: MedicoRepositoryPrisma },
    { provide: AGENDA_REPOSITORY, useClass: AgendaRepositoryPrisma },
    { provide: TURNO_REPOSITORY, useClass: TurnoRepositoryPrisma },
    { provide: TRIAJE_REPOSITORY, useClass: TriajeRepositoryPrisma },
  ],
  exports: [
    PACIENTE_REPOSITORY,
    MEDICO_REPOSITORY,
    AGENDA_REPOSITORY,
    TURNO_REPOSITORY,
    TRIAJE_REPOSITORY,
  ],
})
export class AdmisionModule {}
