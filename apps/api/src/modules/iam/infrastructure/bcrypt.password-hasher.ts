import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import type { Password } from '../domain/password';
import type { PasswordHasher } from '../domain/password-hasher';

/** bcrypt en JS puro: no necesita compilar nada en Windows/Mac/Linux. Costo 10 ≈ 100 ms. */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private static readonly COSTO = 10;

  hash(password: Password): Promise<string> {
    return hash(password.valor, BcryptPasswordHasher.COSTO);
  }

  verificar(plano: string, hashGuardado: string): Promise<boolean> {
    return compare(plano, hashGuardado);
  }
}
