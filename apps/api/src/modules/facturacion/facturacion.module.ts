import { Module } from '@nestjs/common';
import { CoberturaController } from './api/cobertura.controller';
import { CuentasController } from './api/cuentas.controller';
import { ObrasSocialesYTarifasController } from './api/obras-sociales.controller';
import { ReportesController } from './api/reportes.controller';
import { ConsultarCuentaHandler } from './application/consultar-cuenta/consultar-cuenta.handler';
import { CerrarCuentaManualHandler } from './application/cerrar-cuenta/cerrar-cuenta.handler';
import { AbrirCuentaInternacionHandler } from './application/event-handlers/abrir-cuenta-internacion.handler';
import { AplicarCargoConsultaHandler } from './application/event-handlers/aplicar-cargo-consulta.handler';
import { AplicarCargoMedicacionHandler } from './application/event-handlers/aplicar-cargo-medicacion.handler';
import { CerrarCuentaInternacionHandler } from './application/event-handlers/cerrar-cuenta-internacion.handler';
import { ListarObrasSocialesHandler } from './application/listar-obras-sociales/listar-obras-sociales.handler';
import { ListarTarifasHandler } from './application/listar-tarifas/listar-tarifas.handler';
import { ListarCuentasPacienteHandler } from './application/listar-cuentas-paciente/listar-cuentas-paciente.handler';
import { ReporteFacturacionHandler } from './application/reportes/reporte-facturacion.handler';
import { ReporteOcupacionHandler } from './application/reportes/reporte-ocupacion.handler';
import { ValidarCoberturaHandler } from './application/validar-cobertura/validar-cobertura.handler';
import { CONSULTOR_DE_OCUPACION } from './domain/consultor-de-ocupacion';
import { CUENTA_REPOSITORY } from './domain/cuenta.repository';
import { OBRA_SOCIAL_REPOSITORY } from './domain/obra-social.repository';
import { REPORTE_FACTURACION_REPOSITORY } from './domain/reporte-facturacion.repository';
import { TARIFA_REPOSITORY } from './domain/tarifa.repository';
import { VALIDADOR_DE_COBERTURA } from './domain/validador-de-cobertura';
import { ConsultorDeOcupacionPrisma } from './infrastructure/consultor-de-ocupacion.prisma';
import { ValidadorDeCoberturaSimulado } from './infrastructure/validador-de-cobertura.simulado';
import { CuentaRepositoryPrisma } from './infrastructure/cuenta.repository.prisma';
import { ObraSocialRepositoryPrisma } from './infrastructure/obra-social.repository.prisma';
import { ReporteFacturacionRepositoryPrisma } from './infrastructure/reporte-facturacion.repository.prisma';
import { TarifaRepositoryPrisma } from './infrastructure/tarifa.repository.prisma';

/**
 * Facturación y Administración (Back-Office).
 * Responsable: Ezequiel
 */
@Module({
  controllers: [
    CuentasController,
    CoberturaController,
    ReportesController,
    ObrasSocialesYTarifasController,
  ],
  providers: [
    // Casos de uso / Handlers
    ConsultarCuentaHandler,
    CerrarCuentaManualHandler,
    ListarCuentasPacienteHandler,
    ListarObrasSocialesHandler,
    ListarTarifasHandler,
    ValidarCoberturaHandler,
    ReporteFacturacionHandler,
    ReporteOcupacionHandler,

    // Consumidores de eventos (@OnEvent)
    AplicarCargoConsultaHandler,
    AplicarCargoMedicacionHandler,
    AbrirCuentaInternacionHandler,
    CerrarCuentaInternacionHandler,

    // Puertos → Adaptadores
    { provide: CUENTA_REPOSITORY, useClass: CuentaRepositoryPrisma },
    { provide: TARIFA_REPOSITORY, useClass: TarifaRepositoryPrisma },
    { provide: OBRA_SOCIAL_REPOSITORY, useClass: ObraSocialRepositoryPrisma },
    { provide: VALIDADOR_DE_COBERTURA, useClass: ValidadorDeCoberturaSimulado },
    { provide: CONSULTOR_DE_OCUPACION, useClass: ConsultorDeOcupacionPrisma },
    { provide: REPORTE_FACTURACION_REPOSITORY, useClass: ReporteFacturacionRepositoryPrisma },
  ],
  exports: [CUENTA_REPOSITORY, TARIFA_REPOSITORY, OBRA_SOCIAL_REPOSITORY],
})
export class FacturacionModule {}
