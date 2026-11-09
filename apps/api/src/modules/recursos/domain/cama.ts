import { AggregateRoot, generarId, type Id } from '../../../building-blocks/domain';
import { TransicionDeCamaInvalida } from './errores';

export enum EstadoCama {
  LIBRE = 'LIBRE',
  OCUPADA = 'OCUPADA',
  EN_LIMPIEZA = 'EN_LIMPIEZA',
  BLOQUEADA = 'BLOQUEADA',
}

const TRANSICIONES_VALIDAS: Readonly<Record<EstadoCama, readonly EstadoCama[]>> = {
  [EstadoCama.LIBRE]: [EstadoCama.OCUPADA, EstadoCama.BLOQUEADA],
  [EstadoCama.OCUPADA]: [EstadoCama.EN_LIMPIEZA],
  [EstadoCama.EN_LIMPIEZA]: [EstadoCama.LIBRE],
  [EstadoCama.BLOQUEADA]: [EstadoCama.LIBRE],
};

interface CamaProps {
  id: Id;
  habitacionId: Id;
  codigo: string;
  estado: EstadoCama;
  updatedAt?: Date;
}

export class Cama extends AggregateRoot {
  private _habitacionId: Id;
  private _codigo: string;
  private _estado: EstadoCama;
  private _updatedAt: Date;

  private constructor(props: CamaProps) {
    super(props.id);
    this._habitacionId = props.habitacionId;
    this._codigo = props.codigo;
    this._estado = props.estado;
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static crear(props: { id?: Id; habitacionId: Id; codigo: string; estado?: EstadoCama }): Cama {
    return new Cama({
      id: props.id ?? generarId(),
      habitacionId: props.habitacionId,
      codigo: props.codigo,
      estado: props.estado ?? EstadoCama.LIBRE,
      updatedAt: new Date(),
    });
  }

  static reconstituir(props: CamaProps): Cama {
    return new Cama(props);
  }

  get habitacionId(): Id {
    return this._habitacionId;
  }

  get codigo(): string {
    return this._codigo;
  }

  get estado(): EstadoCama {
    return this._estado;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  cambiarEstado(nuevoEstado: EstadoCama): void {
    const permitidos = TRANSICIONES_VALIDAS[this._estado];
    if (!permitidos.includes(nuevoEstado)) {
      throw new TransicionDeCamaInvalida(this._estado, nuevoEstado);
    }

    this._estado = nuevoEstado;
    this._updatedAt = new Date();
  }

  ocupar(): void {
    this.cambiarEstado(EstadoCama.OCUPADA);
  }

  marcarEnLimpieza(): void {
    this.cambiarEstado(EstadoCama.EN_LIMPIEZA);
  }

  marcarLimpia(): void {
    this.cambiarEstado(EstadoCama.LIBRE);
  }

  bloquear(): void {
    this.cambiarEstado(EstadoCama.BLOQUEADA);
  }

  desbloquear(): void {
    this.cambiarEstado(EstadoCama.LIBRE);
  }
}
