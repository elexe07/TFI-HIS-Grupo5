import type { DomainEvent } from './domain-event';
import { Entity } from './entity';
import type { Id } from './id';

/**
 * Raíz de agregado: la entidad por la que se entra a un grupo de entidades y objetos de valor.
 * Es la única que garantiza las invariantes y la única que registra eventos de dominio.
 */
export abstract class AggregateRoot<TId = Id> extends Entity<TId> {
  private readonly eventosPendientes: DomainEvent[] = [];

  protected registrarEvento(evento: DomainEvent): void {
    this.eventosPendientes.push(evento);
  }

  /** Devuelve los eventos acumulados y vacía la lista. Lo llama el caso de uso tras guardar. */
  extraerEventos(): DomainEvent[] {
    const eventos = [...this.eventosPendientes];
    this.eventosPendientes.length = 0;
    return eventos;
  }
}
