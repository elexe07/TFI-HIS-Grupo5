import type { Password } from './password';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');

/** Puerto de salida: el dominio decide qué se hashea; la librería (bcrypt) es un detalle. */
export interface PasswordHasher {
  hash(password: Password): Promise<string>;
  verificar(plano: string, hash: string): Promise<boolean>;
}
