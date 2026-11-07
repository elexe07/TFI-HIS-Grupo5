import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
  EVENT_BUS,
  type EventBus,
} from '../../../../building-blocks/application';
import { HistoriaClinica } from '../../domain/historia-clinica';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class RegistrarEvolucionCommand {
  constructor(
    readonly pacienteId: string,
    readonly medicoId: string,
    readonly motivo: string,
    readonly diagnostico: string,
    readonly tratamiento?: string,
    readonly turnoId?: string,
    readonly internacionId?: string,
  ) {}
}

@Injectable()
export class RegistrarEvolucionHandler implements CasoDeUso<RegistrarEvolucionCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(EVENT_BUS)
    private readonly bus: EventBus,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarEvolucionCommand): Promise<{ id: string }> {
    let historia = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (!historia) {
      historia = HistoriaClinica.abrir(command.pacienteId, this.reloj.ahora());
      await this.repo.guardar(historia);
    }

    const evolucion = historia.registrarEvolucion(
      command.medicoId,
      command.motivo,
      command.diagnostico,
      this.reloj.ahora(),
      command.tratamiento,
      command.turnoId,
      command.internacionId,
    );

    await this.repo.guardar(historia);
    await this.bus.publicar(historia.extraerEventos());

    return { id: evolucion.id };
  }
}

