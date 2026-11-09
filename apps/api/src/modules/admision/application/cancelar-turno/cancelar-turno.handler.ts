import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { TurnoNoEncontrado, TurnoNoPerteneceAlPaciente } from '../../domain/errores';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { TURNO_REPOSITORY, type TurnoRepository } from '../../domain/turno.repository';
import { aTurnoDto, type TurnoDto } from '../turno.dto';
import type { CancelarTurnoCommand } from './cancelar-turno.command';

/** ADM-05. Cancelar turno: solo si está en estado RESERVADO. Si el solicitante es paciente, solo el propio. */
@Injectable()
export class CancelarTurnoHandler implements CasoDeUso<CancelarTurnoCommand, TurnoDto> {
  constructor(
    @Inject(TURNO_REPOSITORY) private readonly turnos: TurnoRepository,
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: CancelarTurnoCommand): Promise<TurnoDto> {
    const turno = await this.turnos.buscarPorId(command.turnoId);
    if (!turno) {
      throw new TurnoNoEncontrado(command.turnoId);
    }

    if (command.esPaciente) {
      const paciente = await this.pacientes.buscarPorUsuarioId(command.usuarioId);
      if (!paciente || paciente.id !== turno.pacienteId) {
        throw new TurnoNoPerteneceAlPaciente();
      }
    }

    turno.cancelar(this.reloj.ahora());
    await this.turnos.guardar(turno);

    return aTurnoDto(turno);
  }
}
