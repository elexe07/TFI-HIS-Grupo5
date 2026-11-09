import { AggregateRoot, generarId, type Id } from '../../../building-blocks/domain';
import { CantidadInvalida, StockInsuficiente } from './errores';

interface InsumoProps {
  id: Id;
  codigo: string;
  nombre: string;
  medicamentoAsociado?: string | null;
  stockActual: number;
  stockMinimo: number;
  updatedAt?: Date;
}

export class Insumo extends AggregateRoot {
  private _codigo: string;
  private _nombre: string;
  private _medicamentoAsociado: string | null;
  private _stockActual: number;
  private _stockMinimo: number;
  private _updatedAt: Date;

  private constructor(props: InsumoProps) {
    super(props.id);
    this._codigo = props.codigo;
    this._nombre = props.nombre;
    this._medicamentoAsociado = props.medicamentoAsociado ?? null;
    this._stockActual = props.stockActual;
    this._stockMinimo = props.stockMinimo;
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static crear(props: {
    id?: Id;
    codigo: string;
    nombre: string;
    medicamentoAsociado?: string | null;
    stockActual: number;
    stockMinimo: number;
  }): Insumo {
    if (!Number.isInteger(props.stockActual) || props.stockActual < 0) {
      throw new CantidadInvalida('El stock inicial debe ser un entero no negativo');
    }
    if (!Number.isInteger(props.stockMinimo) || props.stockMinimo < 0) {
      throw new CantidadInvalida('El stock mínimo debe ser un entero no negativo');
    }

    return new Insumo({
      id: props.id ?? generarId(),
      codigo: props.codigo,
      nombre: props.nombre,
      medicamentoAsociado: props.medicamentoAsociado ?? null,
      stockActual: props.stockActual,
      stockMinimo: props.stockMinimo,
      updatedAt: new Date(),
    });
  }

  static reconstituir(props: InsumoProps): Insumo {
    return new Insumo(props);
  }

  get codigo(): string {
    return this._codigo;
  }

  get nombre(): string {
    return this._nombre;
  }

  get medicamentoAsociado(): string | null {
    return this._medicamentoAsociado;
  }

  get stockActual(): number {
    return this._stockActual;
  }

  get stockMinimo(): number {
    return this._stockMinimo;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  estaBajoMinimo(): boolean {
    return this._stockActual <= this._stockMinimo;
  }

  ingresar(cantidad: number): void {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new CantidadInvalida('La cantidad a ingresar debe ser un entero mayor a cero');
    }

    this._stockActual += cantidad;
    this._updatedAt = new Date();
  }

  descontar(cantidad: number): void {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new CantidadInvalida('La cantidad a descontar debe ser un entero mayor a cero');
    }

    if (cantidad > this._stockActual) {
      throw new StockInsuficiente(this.id, this._stockActual, cantidad);
    }

    this._stockActual -= cantidad;
    this._updatedAt = new Date();
  }
}
