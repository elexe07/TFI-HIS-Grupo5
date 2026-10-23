import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { RolNoEncontrado, UltimoAdministrador, UsuarioNoEncontrado } from '../../domain/errores';
import type { Rol } from '../../domain/rol';
import { ROL_REPOSITORY, type RolRepository } from '../../domain/rol.repository';
import type { Usuario } from '../../domain/usuario';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '../../domain/usuario.repository';
import { aUsuarioDto, type UsuarioDto } from '../usuario.dto';
import type { AsignarRolCommand } from './asignar-rol.command';

/** IAM-03. Invariante que cruza agregados (cuántos admins quedan), por eso vive en el caso de uso. */
@Injectable()
export class AsignarRolHandler implements CasoDeUso<AsignarRolCommand, UsuarioDto> {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    @Inject(ROL_REPOSITORY) private readonly roles: RolRepository,
  ) {}

  async ejecutar(command: AsignarRolCommand): Promise<UsuarioDto> {
    const usuario = await this.usuarios.buscarPorId(command.usuarioId);
    if (!usuario) throw new UsuarioNoEncontrado(command.usuarioId);
    const rol = await this.roles.buscarPorNombre(command.rol);
    if (!rol) throw new RolNoEncontrado(command.rol);

    await this.verificarQueNoEsElUltimoAdministrador(usuario, rol);
    usuario.cambiarRol(rol);
    await this.usuarios.guardar(usuario);

    return aUsuarioDto(usuario);
  }

  private async verificarQueNoEsElUltimoAdministrador(usuario: Usuario, nuevoRol: Rol) {
    const dejaDeSerAdmin =
      usuario.activo && usuario.rol.esAdministrador && !nuevoRol.esAdministrador;
    if (!dejaDeSerAdmin) return;
    if ((await this.usuarios.contarActivosConRol('ADMINISTRADOR')) <= 1) {
      throw new UltimoAdministrador();
    }
  }
}
