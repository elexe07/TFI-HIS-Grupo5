import type { Id } from './id';

/**
 * Entidad: tiene identidad. Dos entidades son iguales si tienen el mismo id,
 * sin importar el resto de sus atributos.
 */
export abstract class Entity<TId = Id> {
  protected constructor(readonly id: TId) {}

  equals(otra?: Entity<TId>): boolean {
    if (otra === undefined || otra === null) return false;
    if (this === otra) return true;
    return this.id === otra.id;
  }
}
