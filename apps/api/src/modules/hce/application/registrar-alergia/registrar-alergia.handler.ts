import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { type SeveridadAlergia } from '../../domain/entidades';
import { HistoriaClinicaNoEncontrada } from '../../domain/errores';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class RegistrarAlergiaCommand {
  constructor(
    readonly pacienteId: string,
    readonly sustancia: string,
    readonly severidad: SeveridadAlergia,
    readonly registradoPor: string,
  ) {}
}

@Injectable()
export class RegistrarAlergiaHandler implements CasoDeUso<RegistrarAlergiaCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarAlergiaCommand): Promise<{ id: string }> {
    const historia = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (!historia) {
      throw new HistoriaClinicaNoEncontrada(`para el paciente ${command.pacienteId}`);
    }

    const alergia = historia.registrarAlergia(
      command.sustancia,
      command.severidad,
      this.reloj.ahora(),
      command.registradoPor,
    );

    await this.repo.guardar(historia);
    return { id: alergia.id };
  }
}
