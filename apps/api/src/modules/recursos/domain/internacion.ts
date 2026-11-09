import { AggregateRoot, generarId, type Id } from '../../../building-blocks/domain';
import { CantidadInvalida, InternacionYaFinalizada } from './errores';
import { PacienteDadoDeAlta, PacienteInternado } from './eventos';

export enum EstadoInternacion {
  ACTIVA = 'ACTIVA',
  ALTA = 'ALTA',
}

interface InternacionProps {
  id: Id;
  pacienteId: Id;
  camaId: Id;
  medicoId: Id;
  motivo: string;
  estado: EstadoInternacion;
  ingresoEn: Date;
  egresoEn?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Internacion extends AggregateRoot {
  private _pacienteId: Id;
  private _camaId: Id;
  private _medicoId: Id;
  private _motivo: string;
  private _estado: EstadoInternacion;
  private _ingresoEn: Date;
  private _egresoEn: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: InternacionProps) {
    super(props.id);
    this._pacienteId = props.pacienteId;
    this._camaId = props.camaId;
    this._medicoId = props.medicoId;
    this._motivo = props.motivo;
    this._estado = props.estado;
    this._ingresoEn = props.ingresoEn;
    this._egresoEn = props.egresoEn ?? null;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  static crear(props: {
    id?: Id;
    pacienteId: Id;
    camaId: Id;
    medicoId: Id;
    motivo: string;
    ingresoEn?: Date;
  }): Internacion {
    const id = props.id ?? generarId();
    const ingreso = props.ingresoEn ?? new Date();

    const internacion = new Internacion({
      id,
      pacienteId: props.pacienteId,
      camaId: props.camaId,
      medicoId: props.medicoId,
      motivo: props.motivo,
      estado: EstadoInternacion.ACTIVA,
      ingresoEn: ingreso,
      egresoEn: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    internacion.registrarEvento(
      new PacienteInternado({
        internacionId: internacion.id,
        pacienteId: internacion.pacienteId,
        camaId: internacion.camaId,
        ingresoEn: ingreso,
      }),
    );

    return internacion;
  }

  static reconstituir(props: InternacionProps): Internacion {
    return new Internacion(props);
  }

  get pacienteId(): Id {
    return this._pacienteId;
  }

  get camaId(): Id {
    return this._camaId;
  }

  get medicoId(): Id {
    return this._medicoId;
  }

  get motivo(): string {
    return this._motivo;
  }

  get estado(): EstadoInternacion {
    return this._estado;
  }

  get ingresoEn(): Date {
    return this._ingresoEn;
  }

  get egresoEn(): Date | null {
    return this._egresoEn;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  darDeAlta(egresoEn: Date = new Date()): void {
    if (this._estado === EstadoInternacion.ALTA) {
      throw new InternacionYaFinalizada(this.id);
    }

    if (egresoEn.getTime() < this._ingresoEn.getTime()) {
      throw new CantidadInvalida('La fecha de egreso no puede ser anterior a la de ingreso');
    }

    this._estado = EstadoInternacion.ALTA;
    this._egresoEn = egresoEn;
    this._updatedAt = new Date();

    this.registrarEvento(
      new PacienteDadoDeAlta({
        internacionId: this.id,
        pacienteId: this._pacienteId,
        ingresoEn: this._ingresoEn,
        egresoEn: this._egresoEn,
      }),
    );
  }
}
