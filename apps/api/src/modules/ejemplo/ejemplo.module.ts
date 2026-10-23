import { Module } from '@nestjs/common';
import { SaludosController } from './api/saludos.controller';
import { CrearSaludoHandler } from './application/crear-saludo/crear-saludo.handler';
import { RegistrarSaludoEnLogHandler } from './application/event-handlers/registrar-saludo-en-log.handler';
import { ListarSaludosHandler } from './application/listar-saludos/listar-saludos.handler';
import { SALUDO_REPOSITORY } from './domain/saludo.repository';
import { SaludoRepositoryEnMemoria } from './infrastructure/saludo.repository.en-memoria';

@Module({
  controllers: [SaludosController],
  providers: [
    // casos de uso
    CrearSaludoHandler,
    ListarSaludosHandler,
    // consumidores de eventos
    RegistrarSaludoEnLogHandler,
    // puertos → adaptadores
    { provide: SALUDO_REPOSITORY, useClass: SaludoRepositoryEnMemoria },
  ],
})
export class EjemploModule {}
