import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { PacienteNoVinculado } from '../../domain/errores';
import { PACIENTE_REPOSITORY, type PacienteRepository } from '../../domain/paciente.repository';
import { aPacienteDto, type PacienteDto } from '../paciente.dto';
import type { ObtenerPacienteDelUsuarioQuery } from './obtener-paciente-del-usuario.query';

/**
 * "Mi ficha": la ficha de paciente vinculada al usuario logueado (GET /pacientes/yo).
 * Lo usa el portal del paciente y, vía `public/`, otros módulos que filtran "lo propio".
 */
@Injectable()
export class ObtenerPacienteDelUsuarioHandler implements CasoDeUso<
  ObtenerPacienteDelUsuarioQuery,
  PacienteDto
> {
  constructor(@Inject(PACIENTE_REPOSITORY) private readonly pacientes: PacienteRepository) {}

  async ejecutar(query: ObtenerPacienteDelUsuarioQuery): Promise<PacienteDto> {
    const paciente = await this.pacientes.buscarPorUsuarioId(query.usuarioId);
    if (!paciente) throw new PacienteNoVinculado();
    return aPacienteDto(paciente);
  }
}
