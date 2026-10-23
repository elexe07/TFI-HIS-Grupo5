import type { Clock } from '../application/clock';

/** Clock para tests: devuelve siempre la misma fecha hasta que se la avanza. */
export class RelojFijo implements Clock {
  constructor(private fecha: Date = new Date('2026-01-01T10:00:00.000Z')) {}

  ahora(): Date {
    return new Date(this.fecha);
  }

  avanzarMinutos(minutos: number): void {
    this.fecha = new Date(this.fecha.getTime() + minutos * 60_000);
  }
}
