import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
  EVENT_BUS,
  type EventBus,
} from '../../../../building-blocks/application';
import { Nombre } from '../../domain/nombre';
import { Saludo } from '../../domain/saludo';
import { SALUDO_REPOSITORY, type SaludoRepository } from '../../domain/saludo.repository';
import { CrearSaludoCommand, type SaludoCreadoResultado } from './crear-saludo.command';

@Injectable()
export class CrearSaludoHandler implements CasoDeUso<CrearSaludoCommand, SaludoCreadoResultado> {
  constructor(
    @Inject(SALUDO_REPOSITORY) private readonly saludos: SaludoRepository,
    @Inject(EVENT_BUS) private readonly bus: EventBus,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: CrearSaludoCommand): Promise<SaludoCreadoResultado> {
    const saludo = Saludo.crear(Nombre.crear(command.destinatario), this.reloj.ahora());

    await this.saludos.guardar(saludo);
    await this.bus.publicar(saludo.extraerEventos());

    return { id: saludo.id, mensaje: saludo.mensaje };
  }
}
