import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { BuscarPacientesQuery } from './buscar-pacientes.query';

/** ADM-02. Buscar paciente por documento o apellido. */
@Injectable()
export class BuscarPacientesHandler implements CasoDeUso<BuscarPacientesQuery, PacienteDto[]> {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository) {}

  async ejecutar(query: BuscarPacientesQuery): Promise<PacienteDto[]> {
    const lista = await this.pacientes.buscar({
      documento: query.documento,
      apellido: query.apellido,
    });
    return lista.map(aPacienteDto);
  }
}

