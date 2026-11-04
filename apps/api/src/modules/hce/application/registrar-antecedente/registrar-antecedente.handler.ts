import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { HistoriaClinicaNoEncontrada } from '../../domain/errores';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class RegistrarAntecedenteCommand {
  constructor(
    readonly pacienteId: string,
    readonly parentesco: string,
    readonly condicion: string,
    readonly registradoPor: string,
  ) {}
}

@Injectable()
export class RegistrarAntecedenteHandler implements CasoDeUso<RegistrarAntecedenteCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarAntecedenteCommand): Promise<{ id: string }> {
    const historia = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (!historia) {
      throw new HistoriaClinicaNoEncontrada(`para el paciente ${command.pacienteId}`);
    }

    const antecedente = historia.registrarAntecedente(
      command.parentesco,
      command.condicion,
      this.reloj.ahora(),
      command.registradoPor,
    );

    await this.repo.guardar(historia);
    return { id: antecedente.id };
  }
}

