import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Tokens, UsuarioAutenticado } from '../application/ports/tokens';

/** Claims del JWT. `sub` es el estándar para el id del sujeto. */
interface Claims extends Omit<UsuarioAutenticado, 'id'> {
  sub: string;
}

/** Adaptador JWT del puerto Tokens. Secreto y duración vienen de JwtModule (iam.module.ts). */
@Injectable()
export class JwtTokens implements Tokens {
  constructor(private readonly jwt: JwtService) {}

  emitir(usuario: UsuarioAutenticado): Promise<string> {
    const { id, ...resto } = usuario;
    const claims: Claims = { sub: id, ...resto };
    return this.jwt.signAsync(claims);
  }

  async verificar(token: string): Promise<UsuarioAutenticado | null> {
    try {
      const { sub, email, nombre, rol, permisos } = await this.jwt.verifyAsync<Claims>(token);
      return { id: sub, email, nombre, rol, permisos };
    } catch {
      return null; // firma inválida, vencido o mal formado
    }
  }
}
