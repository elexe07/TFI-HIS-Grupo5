import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { HistoriaClinica } from '../../domain/historia-clinica';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class AbrirHistoriaCommand {
  constructor(
    readonly pacienteId: string,
    readonly origenEventoId?: string,
  ) {}
}

@Injectable()
export class AbrirHistoriaHandler implements CasoDeUso<AbrirHistoriaCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: AbrirHistoriaCommand): Promise<{ id: string }> {
    // Si viene de un evento y ya existe procesado, idempotencia (HCE-01)
    if (command.origenEventoId) {
      const existentePorEvento = await this.repo.buscarPorOrigenEventoId(command.origenEventoId);
      if (existentePorEvento) {
        return { id: existentePorEvento.id };
      }
    }

    const existente = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (existente) {
      return { id: existente.id };
    }

    const historia = HistoriaClinica.abrir(
      command.pacienteId,
      this.reloj.ahora(),
      command.origenEventoId,
    );

    await this.repo.guardar(historia);
    return { id: historia.id };
  }
}

