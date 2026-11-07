import { Inject, Injectable } from '@nestjs/common';
import {
  type CasoDeUso,
  CLOCK,
  type Clock,
} from '../../../../building-blocks/application';
import { type TipoEstudio } from '../../domain/entidades';
import { HistoriaClinicaNoEncontrada } from '../../domain/errores';
import {
  HISTORIA_CLINICA_REPOSITORY,
  type HistoriaClinicaRepository,
} from '../../domain/historia-clinica.repository';

export class RegistrarEstudioCommand {
  constructor(
    readonly pacienteId: string,
    readonly tipo: TipoEstudio,
    readonly descripcion: string,
    readonly fecha: Date,
    readonly registradoPor: string,
    readonly resultado?: string,
  ) {}
}

@Injectable()
export class RegistrarEstudioHandler implements CasoDeUso<RegistrarEstudioCommand, { id: string }> {
  constructor(
    @Inject(HISTORIA_CLINICA_REPOSITORY)
    private readonly repo: HistoriaClinicaRepository,
    @Inject(CLOCK)
    private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarEstudioCommand): Promise<{ id: string }> {
    const historia = await this.repo.buscarPorPacienteId(command.pacienteId);
    if (!historia) {
      throw new HistoriaClinicaNoEncontrada(`para el paciente ${command.pacienteId}`);
    }

    const estudio = historia.registrarEstudio(
      command.tipo,
      command.descripcion,
      command.fecha,
      command.registradoPor,
      this.reloj.ahora(),
      command.resultado,
    );

    await this.repo.guardar(historia);
    return { id: estudio.id };
  }
}

