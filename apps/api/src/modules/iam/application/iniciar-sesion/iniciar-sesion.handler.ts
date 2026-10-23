import { Inject, Injectable } from '@nestjs/common';
import type { CasoDeUso } from '../../../../building-blocks/application';
import { Email } from '../../domain/email';
import { CredencialesInvalidas } from '../../domain/errores';
import { PASSWORD_HASHER, type PasswordHasher } from '../../domain/password-hasher';
import type { Usuario } from '../../domain/usuario';
import { USUARIO_REPOSITORY, type UsuarioRepository } from '../../domain/usuario.repository';
import { TOKENS, type Tokens } from '../ports/tokens';
import { aUsuarioAutenticado } from '../usuario.dto';
import type { IniciarSesionCommand, SesionIniciada } from './iniciar-sesion.command';

/** IAM-02. Cualquier falla (email, password, inactivo) devuelve el mismo error: no damos pistas. */
@Injectable()
export class IniciarSesionHandler implements CasoDeUso<IniciarSesionCommand, SesionIniciada> {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasher,
    @Inject(TOKENS) private readonly tokens: Tokens,
  ) {}

  async ejecutar(command: IniciarSesionCommand): Promise<SesionIniciada> {
    const usuario = await this.buscar(command.email);
    if (!usuario?.puedeIniciarSesion) throw new CredencialesInvalidas();

    const coincide = await this.hasher.verificar(command.password, usuario.passwordHash);
    if (!coincide) throw new CredencialesInvalidas();

    const autenticado = aUsuarioAutenticado(usuario);
    return { token: await this.tokens.emitir(autenticado), usuario: autenticado };
  }

  private async buscar(email: string): Promise<Usuario | null> {
    try {
      return await this.usuarios.buscarPorEmail(Email.crear(email));
    } catch {
      return null; // email mal formado → mismas credenciales inválidas
    }
  }
}
