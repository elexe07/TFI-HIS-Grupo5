import {
  AggregateRoot,
  ErrorDeValidacion,
  generarId,
  type Id,
} from '../../../building-blocks/domain';
import { Cargo } from './cargo';
import { EstadoCuenta, type TipoCuenta } from './enums';
import { CargoDuplicado, CuentaYaCerrada } from './errores';

export interface PropsCrearCuenta {
  readonly pacienteId: Id;
  readonly tipo: TipoCuenta;
  readonly referenciaId: Id;
  readonly coberturaValidada?: boolean;
  readonly porcentajeCobertura?: number | null;
  readonly ahora?: Date;
}

export class Cuenta extends AggregateRoot<Id> {
  private readonly _cargos: Cargo[];
  private _estado: EstadoCuenta;
  private _coberturaValidada: boolean;
  private _porcentajeCobertura: number | null;
  private _updatedAt: Date;

  private constructor(
    id: Id,
    readonly pacienteId: Id,
    readonly tipo: TipoCuenta,
    readonly referenciaId: Id,
    coberturaValidada: boolean,
    porcentajeCobertura: number | null,
    estado: EstadoCuenta,
    readonly createdAt: Date,
    updatedAt: Date,
    cargos: Cargo[] = [],
  ) {
    super(id);
    this._coberturaValidada = coberturaValidada;
    this._porcentajeCobertura = porcentajeCobertura;
    this._estado = estado;
    this._updatedAt = updatedAt;
    this._cargos = [...cargos];
  }

  get cargos(): readonly Cargo[] {
    return this._cargos;
  }

  get estado(): EstadoCuenta {
    return this._estado;
  }

  get coberturaValidada(): boolean {
    return this._coberturaValidada;
  }

  get porcentajeCobertura(): number | null {
    return this._porcentajeCobertura;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static abrir(props: PropsCrearCuenta, id?: Id): Cuenta {
    if (!props.pacienteId) {
      throw new ErrorDeValidacion('El pacienteId es obligatorio');
    }
    if (!props.referenciaId) {
      throw new ErrorDeValidacion('La referenciaId es obligatoria');
    }

    const ahora = props.ahora ?? new Date();
    const porcentaje = props.porcentajeCobertura ?? null;

    if (porcentaje !== null && (porcentaje < 0 || porcentaje > 100)) {
      throw new ErrorDeValidacion('El porcentaje de cobertura debe estar entre 0 y 100');
    }

    return new Cuenta(
      id ?? generarId(),
      props.pacienteId,
      props.tipo,
      props.referenciaId,
      props.coberturaValidada ?? false,
      porcentaje,
      EstadoCuenta.ABIERTA,
      ahora,
      ahora,
      [],
    );
  }

  static rehidratar(
    id: Id,
    pacienteId: Id,
    tipo: TipoCuenta,
    referenciaId: Id,
    coberturaValidada: boolean,
    porcentajeCobertura: number | null,
    estado: EstadoCuenta,
    createdAt: Date,
    updatedAt: Date,
    cargos: Cargo[] = [],
  ): Cuenta {
    return new Cuenta(
      id,
      pacienteId,
      tipo,
      referenciaId,
      coberturaValidada,
      porcentajeCobertura,
      estado,
      createdAt,
      updatedAt,
      cargos,
    );
  }

  tieneCargoConOrigenEvento(origenEventoId: string): boolean {
    return this._cargos.some((c) => c.origenEventoId === origenEventoId);
  }

  agregarCargo(cargo: Cargo, ahora: Date = new Date()): void {
    if (this._estado === EstadoCuenta.CERRADA) {
      throw new CuentaYaCerrada();
    }
    if (this.tieneCargoConOrigenEvento(cargo.origenEventoId)) {
      throw new CargoDuplicado(cargo.origenEventoId);
    }

    this._cargos.push(cargo);
    this._updatedAt = ahora;
  }

  cerrar(ahora: Date = new Date()): void {
    if (this._estado === EstadoCuenta.CERRADA) {
      return;
    }
    this._estado = EstadoCuenta.CERRADA;
    this._updatedAt = ahora;
  }

  aplicarCobertura(porcentaje: number, ahora: Date = new Date()): void {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new ErrorDeValidacion('El porcentaje de cobertura debe estar entre 0 y 100');
    }
    this._coberturaValidada = true;
    this._porcentajeCobertura = porcentaje;
    this._updatedAt = ahora;
  }

  calcularTotalBruto(): number {
    const total = this._cargos.reduce((acc, c) => acc + c.montoTotal, 0);
    return Number(total.toFixed(2));
  }

  calcularTotalDescuento(): number {
    if (!this._porcentajeCobertura || this._porcentajeCobertura <= 0) {
      return 0;
    }
    const bruto = this.calcularTotalBruto();
    const descuento = (bruto * this._porcentajeCobertura) / 100;
    return Number(descuento.toFixed(2));
  }

  calcularTotalAPagar(): number {
    const aPagar = this.calcularTotalBruto() - this.calcularTotalDescuento();
    return Number(Math.max(0, aPagar).toFixed(2));
  }
}

