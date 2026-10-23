import type { Password } from '../domain/password';
import type { PasswordHasher } from '../domain/password-hasher';

/** Hasher reversible y rápido para tests unitarios. Jamás en producción. */
export class PasswordHasherFalso implements PasswordHasher {
  hash(password: Password): Promise<string> {
    return Promise.resolve(`hash(${password.valor})`);
  }

  verificar(plano: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hash(${plano})`);
  }
}
