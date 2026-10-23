import type { UsuarioAutenticado } from '../ports/tokens';

export class IniciarSesionCommand {
  constructor(
    readonly email: string,
    readonly password: string,
  ) {}
}

export interface SesionIniciada {
  token: string;
  usuario: UsuarioAutenticado;
}
