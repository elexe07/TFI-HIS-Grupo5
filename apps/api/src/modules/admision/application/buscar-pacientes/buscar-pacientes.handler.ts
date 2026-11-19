import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { BuscarPacientesQuery } from './buscar-pacientes.query';

/** ADM-02. Buscar paciente por documento o apellido. Un paciente solo se encuentra a sí mismo. */
@Injectable()
export class BuscarPacientesHandler implements CasoDeUso<BuscarPacientesQuery, PacienteDto[]> {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository) {}

  async ejecutar(query: BuscarPacientesQuery): Promise<PacienteDto[]> {
    if (query.solicitante?.esPaciente) {
      const propio = await this.pacientes.buscarPorUsuarioId(query.solicitante.usuarioId);
      return propio ? [aPacienteDto(propio)] : [];
    }
    const lista = await this.pacientes.buscar({
      documento: query.documento,
      apellido: query.apellido,
    });
    return lista.map(aPacienteDto);
  }
}
