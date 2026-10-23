import type { Tokens, UsuarioAutenticado } from '../application/ports/tokens';

/** Tokens sin firma para tests: el "token" es el usuario serializado en base64. */
export class TokensFalsos implements Tokens {
  emitir(usuario: UsuarioAutenticado): Promise<string> {
    return Promise.resolve(Buffer.from(JSON.stringify(usuario)).toString('base64url'));
  }

  verificar(token: string): Promise<UsuarioAutenticado | null> {
    try {
      return Promise.resolve(
        JSON.parse(Buffer.from(token, 'base64url').toString()) as UsuarioAutenticado,
      );
    } catch {
      return Promise.resolve(null);
    }
  }
}
