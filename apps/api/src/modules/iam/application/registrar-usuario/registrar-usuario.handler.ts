import { Inject, Injectable } from '@nestjs/common';
import { type CasoDeUso, CLOCK, type Clock } from '../../../../building-blocks/application';
import { Email } from '../../domain/email';
import { EmailYaRegistrado, RolNoEncontrado } from '../../domain/errores';
import { Password } from '../../domain/password';
import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/password-hasher';
import { ROL_REPOSITORY, type RolRepository } from '../../domain/rol.repository';
import { Usuario } from '../../domain/usuario';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '../../domain/usuario.repository';
import { aUsuarioDto, type UsuarioDto } from '../usuario.dto';
import type { RegistrarUsuarioCommand } from './registrar-usuario.command';

/** IAM-01. La contraseña se valida como objeto de valor y se hashea antes de tocar el agregado. */
@Injectable()
export class RegistrarUsuarioHandler implements CasoDeUso<RegistrarUsuarioCommand, UsuarioDto> {
  // eslint-disable-next-line max-params -- inyección de dependencias
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    @Inject(ROL_REPOSITORY) private readonly roles: RolRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(CLOCK) private readonly reloj: Clock,
  ) {}

  async ejecutar(command: RegistrarUsuarioCommand): Promise<UsuarioDto> {
    const email = Email.crear(command.email);
    const password = Password.crear(command.password);

    if (await this.usuarios.buscarPorEmail(email)) throw new EmailYaRegistrado(email.valor);
    const rol = await this.roles.buscarPorNombre(command.rol);
    if (!rol) throw new RolNoEncontrado(command.rol);

    const usuario = Usuario.crear(
      { email, nombre: command.nombre, passwordHash: await this.hasher.hash(password), rol },
      this.reloj.ahora(),
    );
    await this.usuarios.guardar(usuario);

    return aUsuarioDto(usuario);
  }
}
