import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BuildingBlocksModule } from './building-blocks/building-blocks.module';
import { validarEnv } from './config/env';
import { HealthModule } from './health/health.module';
import { AdmisionModule } from './modules/admision/admision.module';
import { EjemploModule } from './modules/ejemplo/ejemplo.module';
import { EnfermeriaModule } from './modules/enfermeria/enfermeria.module';
import { FacturacionModule } from './modules/facturacion/facturacion.module';
import { HceModule } from './modules/hce/hce.module';
import { IamModule } from './modules/iam/iam.module';
import { RecursosModule } from './modules/recursos/recursos.module';

/**
 * Composición del monolito modular. Acá solo se enchufan módulos: nada de lógica.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validarEnv,
      envFilePath: ['.env', '../../.env'],
    }),
    BuildingBlocksModule,
    HealthModule,
    // Módulo de referencia: muestra la anatomía completa. Borrar cuando los seis reales estén.
    EjemploModule,
    // Módulos del HIS (uno por integrante)
    IamModule,
    AdmisionModule,
    HceModule,
    EnfermeriaModule,
    RecursosModule,
    FacturacionModule,
  ],
})
export class AppModule {}
