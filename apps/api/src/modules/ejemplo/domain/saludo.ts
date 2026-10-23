import { AggregateRoot, generarId } from '../../../building-blocks/domain';
import { SaludoCreado } from './events/saludo-creado';
import type { Nombre } from './nombre';

export class Saludo extends AggregateRoot {
  private constructor(
    id: string,
    readonly destinatario: Nombre,
    readonly creadoEn: Date,
  ) {
    super(id);
  }

  /** Crea un saludo nuevo y registra el evento. La hora viene de afuera (Clock), nunca `new Date()`. */
  static crear(destinatario: Nombre, ahora: Date): Saludo {
    const saludo = new Saludo(generarId(), destinatario, ahora);
    saludo.registrarEvento(new SaludoCreado(saludo.id, destinatario.valor, ahora));
    return saludo;
  }

  /** Reconstruye desde la base sin disparar eventos. Lo usa el repositorio. */
  static reconstituir(id: string, destinatario: Nombre, creadoEn: Date): Saludo {
    return new Saludo(id, destinatario, creadoEn);
  }

  get mensaje(): string {
    return `Hola, ${this.destinatario.valor}`;
  }
}
