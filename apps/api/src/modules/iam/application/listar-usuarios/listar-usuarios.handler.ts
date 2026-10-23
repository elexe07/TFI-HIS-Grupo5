import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '../../domain/usuario.repository';
import { aUsuarioDto, type UsuarioDto } from '../usuario.dto';

/** IAM-05. Consulta simple: sin paginación en el alcance actual. */
@Injectable()
export class ListarUsuariosHandler implements CasoDeUso<void, UsuarioDto[]> {
  constructor(@Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository) {}

  async ejecutar(): Promise<UsuarioDto[]> {
    return (await this.usuarios.listar()).map(aUsuarioDto);
  }
}
