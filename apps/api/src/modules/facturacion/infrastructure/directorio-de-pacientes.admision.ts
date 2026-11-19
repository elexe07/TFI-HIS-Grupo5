import { Injectable } from '@nestjs/common';
import {
  ObtenerPacienteDelUsuarioHandler,
  ObtenerPacienteDelUsuarioQuery,
  PacienteNoVinculado,
} from '../../admision/public';
import type { DirectorioDePacientes } from '../domain/directorio-de-pacientes';

/** Adaptador: resuelve el paciente del usuario con el caso de uso público de Admisión. */
@Injectable()
export class DirectorioDePacientesAdmision implements DirectorioDePacientes {
  constructor(private readonly obtenerPacienteDelUsuario: ObtenerPacienteDelUsuarioHandler) {}

  async pacienteIdDelUsuario(usuarioId: string): Promise<string | null> {
    try {
      const ficha = await this.obtenerPacienteDelUsuario.ejecutar(
        new ObtenerPacienteDelUsuarioQuery(usuarioId),
      );
      return ficha.id;
    } catch (error) {
      if (error instanceof PacienteNoVinculado) return null;
      throw error;
    }
  }
}
