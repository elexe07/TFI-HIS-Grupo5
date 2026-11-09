import { Entity, generarId, type Id } from '../../../building-blocks/domain';

interface HabitacionProps {
  id: Id;
  sector: string;
  numero: string;
}

export class Habitacion extends Entity {
  private _sector: string;
  private _numero: string;

  private constructor(props: HabitacionProps) {
    super(props.id);
    this._sector = props.sector;
    this._numero = props.numero;
  }

  static crear(props: { id?: Id; sector: string; numero: string }): Habitacion {
    return new Habitacion({
      id: props.id ?? generarId(),
      sector: props.sector,
      numero: props.numero,
    });
  }

  static reconstituir(props: HabitacionProps): Habitacion {
    return new Habitacion(props);
  }

  get sector(): string {
    return this._sector;
  }

  get numero(): string {
    return this._numero;
  }
}
