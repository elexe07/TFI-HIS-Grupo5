import { Module } from '@nestjs/common';
import { CoberturaController } from './api/cobertura.controller';
import { CuentasController } from './api/cuentas.controller';
import { ReportesController } from './api/reportes.controller';
import { ConsultarCuentaHandler } from './application/consultar-cuenta/consultar-cuenta.handler';
import { AbrirCuentaInternacionHandler } from './application/event-handlers/abrir-cuenta-internacion.handler';
import { AplicarCargoConsultaHandler } from './application/event-handlers/aplicar-cargo-consulta.handler';
import { AplicarCargoMedicacionHandler } from './application/event-handlers/aplicar-cargo-medicacion.handler';
import { CerrarCuentaInternacionHandler } from './application/event-handlers/cerrar-cuenta-internacion.handler';
import { ListarCuentasPacienteHandler } from './application/listar-cuentas-paciente/listar-cuentas-paciente.handler';
import { ReporteFacturacionHandler } from './application/reportes/reporte-facturacion.handler';
import { ReporteOcupacionHandler } from './application/reportes/reporte-ocupacion.handler';
import { ValidarCoberturaHandler } from './application/validar-cobertura/validar-cobertura.handler';
import { CONSULTOR_DE_OCUPACION } from './domain/ports/consultor-de-ocupacion';
import { CUENTA_REPOSITORY } from './domain/ports/cuenta.repository';
import { OBRA_SOCIAL_REPOSITORY } from './domain/ports/obra-social.repository';
import { REPORTE_FACTURACION_REPOSITORY } from './domain/ports/reporte-facturacion.repository';
import { TARIFA_REPOSITORY } from './domain/ports/tarifa.repository';
import { VALIDADOR_DE_COBERTURA } from './domain/ports/validador-de-cobertura';
import { ConsultorDeOcupacionFake } from './infrastructure/adapters/consultor-de-ocupacion.fake';
import { ValidadorDeCoberturaFake } from './infrastructure/adapters/validador-de-cobertura.fake';
import { CuentaRepositoryPrisma } from './infrastructure/repositories/cuenta.repository.prisma';
import { ObraSocialRepositoryPrisma } from './infrastructure/repositories/obra-social.repository.prisma';
import { ReporteFacturacionRepositoryPrisma } from './infrastructure/repositories/reporte-facturacion.repository.prisma';
import { TarifaRepositoryPrisma } from './infrastructure/repositories/tarifa.repository.prisma';

/**
 * Facturación y Administración (Back-Office).
 * Responsable: Ezequiel
 */
@Module({
  controllers: [CuentasController, CoberturaController, ReportesController],
  providers: [
    // Casos de uso / Handlers
    ConsultarCuentaHandler,
    ListarCuentasPacienteHandler,
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
    { provide: VALIDADOR_DE_COBERTURA, useClass: ValidadorDeCoberturaFake },
    { provide: CONSULTOR_DE_OCUPACION, useClass: ConsultorDeOcupacionFake },
    { provide: REPORTE_FACTURACION_REPOSITORY, useClass: ReporteFacturacionRepositoryPrisma },
  ],
  exports: [CUENTA_REPOSITORY, TARIFA_REPOSITORY, OBRA_SOCIAL_REPOSITORY],
})
export class FacturacionModule {}
