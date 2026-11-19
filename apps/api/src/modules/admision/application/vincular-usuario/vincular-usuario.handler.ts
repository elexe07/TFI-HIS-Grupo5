import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { PacienteNoEncontrado, UsuarioYaVinculado } from '../../domain/errores';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { VincularUsuarioCommand } from './vincular-usuario.command';

/** Vincula una ficha de paciente con su usuario del portal (PATCH /pacientes/:id/usuario). */
@Injectable()
export class VincularUsuarioHandler implements CasoDeUso<VincularUsuarioCommand, PacienteDto> {
  constructor(
    @Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: VincularUsuarioCommand): Promise<PacienteDto> {
    const paciente = await this.pacientes.buscarPorId(command.pacienteId);
    if (!paciente) throw new PacienteNoEncontrado(command.pacienteId);

    const yaVinculado = await this.pacientes.buscarPorUsuarioId(command.usuarioId);
    if (yaVinculado && yaVinculado.id !== paciente.id) throw new UsuarioYaVinculado();

    paciente.vincularUsuario(command.usuarioId, this.reloj.ahora());
    await this.pacientes.guardar(paciente);
    return aPacienteDto(paciente);
  }
}
