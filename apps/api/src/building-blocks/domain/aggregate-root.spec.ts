import { AggregateRoot } from './aggregate-root';
import { DomainEventBase } from './domain-event';

class AlgoPaso extends DomainEventBase {
  readonly nombre = 'test.algo-paso';

  constructor() {
    super(new Date('2026-01-01T00:00:00Z'));
  }
}

class AgregadoDePrueba extends AggregateRoot {
  constructor(id: string) {
    super(id);
  }

  hacerAlgo(): void {
    this.registrarEvento(new AlgoPaso());
  }
}

describe('AggregateRoot', () => {
  it('acumula los eventos registrados y los entrega una sola vez', () => {
    const agregado = new AgregadoDePrueba('a1');
    agregado.hacerAlgo();
    agregado.hacerAlgo();

    const eventos = agregado.extraerEventos();

    expect(eventos).toHaveLength(2);
    expect(eventos[0]?.nombre).toBe('test.algo-paso');
    expect(agregado.extraerEventos()).toHaveLength(0);
  });

  it('dos agregados con el mismo id son iguales aunque sean instancias distintas', () => {
    expect(new AgregadoDePrueba('x').equals(new AgregadoDePrueba('x'))).toBe(true);
    expect(new AgregadoDePrueba('x').equals(new AgregadoDePrueba('y'))).toBe(false);
  });

  it('cada evento tiene un id propio', () => {
    const agregado = new AgregadoDePrueba('a1');
    agregado.hacerAlgo();
    agregado.hacerAlgo();
    const [primero, segundo] = agregado.extraerEventos();
    expect(primero?.eventoId).not.toBe(segundo?.eventoId);
  });
});
