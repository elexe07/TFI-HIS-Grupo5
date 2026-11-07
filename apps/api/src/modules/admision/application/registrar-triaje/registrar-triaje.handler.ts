import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { PacienteNoEncontrado } from '../../domain/errores';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { Triaje } from '../../domain/triaje';
import { TRIAJE_REPOSITORY, type TriajeRepository } from '../../domain/triaje.repository';
import { aTriajeDto, type TriajeDto } from '../triaje.dto';
import type { RegistrarTriajeCommand } from './registrar-triaje.command';

/** ADM-06. Registrar triaje de guardia: nivel obligatorio. */
@Injectable()
export class RegistrarTriajeHandler implements CasoDeUso<RegistrarTriajeCommand, TriajeDto> {
  constructor(
    @Inject(TRIAJE_REPOSITORY) private readonly triajes: TriajeRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarTriajeCommand): Promise<TriajeDto> {
    const paciente = await this.pacientes.buscarPorId(command.pacienteId);
    if (!paciente) {
      throw new PacienteNoEncontrado(command.pacienteId);
    }

    const triaje = Triaje.crear(
      {
        pacienteId: command.pacienteId,
        nivel: command.nivel,
        motivo: command.motivo,
        registradoPor: command.registradoPor,
      },
      this.reloj.ahora(),
    );

    await this.triajes.guardar(triaje);

    return aTriajeDto(triaje);
  }
}
