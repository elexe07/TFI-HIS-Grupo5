import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CLOCK } from './application/clock';
import { EVENT_BUS } from './application/event-bus';
import { EventEmitterEventBus } from './infrastructure/event-emitter.event-bus';
import { PrismaService } from './infrastructure/prisma/prisma.service';
import { SystemClock } from './infrastructure/system-clock';

/**
 * Shared kernel. Es @Global para que los módulos no tengan que importarlo uno por uno.
 * Solo contiene cosas genéricas: si algo lo usa un solo módulo, no va acá.
 */
@Global()
@Module({
  imports: [EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' })],
  providers: [
    PrismaService,
    { provide: EVENT_BUS, useClass: EventEmitterEventBus },
    { provide: CLOCK, useClass: SystemClock },
  ],
  exports: [PrismaService, EVENT_BUS, CLOCK],
})
export class BuildingBlocksModule {}
