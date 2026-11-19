import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PacienteAjeno, PacienteNoEncontrado } from '../../domain/errores';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { BuscarPacientePorIdQuery } from './buscar-paciente-por-id.query';

@Injectable()
export class BuscarPacientePorIdHandler implements CasoDeUso<
  BuscarPacientePorIdQuery,
  PacienteDto
> {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository) {}

  async ejecutar(query: BuscarPacientePorIdQuery): Promise<PacienteDto> {
    const paciente = await this.pacientes.buscarPorId(query.id);
    if (!paciente) {
      throw new PacienteNoEncontrado(query.id);
    }
    const { solicitante } = query;
    if (solicitante?.esPaciente && paciente.usuarioId !== solicitante.usuarioId) {
      throw new PacienteAjeno();
    }
    return aPacienteDto(paciente);
  }
}
