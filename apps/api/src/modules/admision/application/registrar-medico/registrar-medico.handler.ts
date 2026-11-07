import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { MedicoYaExiste } from '../../domain/errores';
import { Medico } from '../../domain/medico';
import { MEDICO_REPOSITORY, type MedicoRepository } from '../../domain/medico.repository';
import { aMedicoDto, type MedicoDto } from '../medico.dto';
import type { RegistrarMedicoCommand } from './registrar-medico.command';

@Injectable()
export class RegistrarMedicoHandler implements CasoDeUso<RegistrarMedicoCommand, MedicoDto> {
  constructor(
    @Inject(MEDICO_REPOSITORY) private readonly medicos: MedicoRepository,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarMedicoCommand): Promise<MedicoDto> {
    const existente = await this.medicos.buscarPorMatricula(command.matricula);
    if (existente) {
      throw new MedicoYaExiste(command.matricula);
    }

    const medico = Medico.crear(
      {
        usuarioId: command.usuarioId,
        matricula: command.matricula,
        nombre: command.nombre,
        apellido: command.apellido,
        especialidad: command.especialidad,
      },
      this.reloj.ahora(),
    );

    await this.medicos.guardar(medico);
    return aMedicoDto(medico);
  }
}

