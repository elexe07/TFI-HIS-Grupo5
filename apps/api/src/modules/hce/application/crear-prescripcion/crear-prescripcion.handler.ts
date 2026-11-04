import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
  EVENT_BUS,
  type EventBus,
} from '../../../../building-blocks/application';
import { HistoriaClinicaNoEncontrada } from '../../domain/errores';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class CrearPrescripcionCommand {
  constructor(
    readonly pacienteId: string,
    readonly medicoId: string,
    readonly medicamento: string,
    readonly dosis: string,
    readonly frecuenciaHoras: number,
    readonly duracionDias: number,
    readonly evolucionId?: string,
    readonly internacionId?: string,
  ) {}
}

@Injectable()
export class CrearPrescripcionHandler implements CasoDeUso<CrearPrescripcionCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(EVENT_BUS)
    private readonly bus: EventBus,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: CrearPrescripcionCommand): Promise<{ id: string }> {
    const historia = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (!historia) {
      throw new HistoriaClinicaNoEncontrada(`para el paciente ${command.pacienteId}`);
    }

    const prescripcion = historia.crearPrescripcion(
      command.medicoId,
      command.medicamento,
      command.dosis,
      command.frecuenciaHoras,
      command.duracionDias,
      this.reloj.ahora(),
      command.evolucionId,
      command.internacionId,
    );

    await this.repo.guardar(historia);
    await this.bus.publicar(historia.extraerEventos());

    return { id: prescripcion.id };
  }
}

