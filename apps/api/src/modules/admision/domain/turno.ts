import { AggregateRoot, ErrorDeValidacion, generarId } from '../../../building-blocks/domain';
import { TurnoNoCancelable } from './errores';
import { EstadoTurno } from './tipos';

export class DatosDeTurnoInvalidos extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'DATOS_TURNO_INVALIDOS');
  }
}

export interface PropsTurno {
  pacienteId: string;
  medicoId: string;
  inicio: Date;
  fin: Date;
  estado: EstadoTurno;
  motivoConsulta: string | null;
  creadoPor: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CrearTurnoDatos {
  pacienteId: string;
  medicoId: string;
  inicio: Date;
  fin: Date;
  motivoConsulta?: string | null;
  creadoPor: string;
}

function validarIdTurno(id: string | undefined, campo: string): string {
  const limpio = id?.trim() ?? '';
  if (!limpio) throw new DatosDeTurnoInvalidos(`El ${campo} es obligatorio`);
  return limpio;
}

function validarFechasTurno(inicio: Date, fin: Date): void {
  if (!inicio || isNaN(inicio.getTime()))
    throw new DatosDeTurnoInvalidos('La fecha de inicio es inválida');
  if (!fin || isNaN(fin.getTime())) throw new DatosDeTurnoInvalidos('La fecha de fin es inválida');
  if (fin <= inicio)
    throw new DatosDeTurnoInvalidos('La hora de fin debe ser posterior a la de inicio');
}

export class Turno extends AggregateRoot {
  private constructor(
    id: string,
    private readonly props: PropsTurno,
  ) {
    super(id);
  }

  static crear(datos: CrearTurnoDatos, ahora: Date): Turno {
    const pacienteId = validarIdTurno(datos.pacienteId, 'pacienteId');
    const medicoId = validarIdTurno(datos.medicoId, 'medicoId');
    const creadoPor = validarIdTurno(datos.creadoPor, 'creadoPor');
    validarFechasTurno(datos.inicio, datos.fin);

    return new Turno(generarId(), {
      pacienteId,
      medicoId,
      inicio: datos.inicio,
      fin: datos.fin,
      estado: EstadoTurno.RESERVADO,
      motivoConsulta: datos.motivoConsulta?.trim() || null,
      creadoPor,
      createdAt: ahora,
      updatedAt: ahora,
    });
  }

  static reconstituir(id: string, props: PropsTurno): Turno {
    return new Turno(id, props);
  }

  get pacienteId(): string {
    return this.props.pacienteId;
  }
  get medicoId(): string {
    return this.props.medicoId;
  }
  get inicio(): Date {
    return this.props.inicio;
  }
  get fin(): Date {
    return this.props.fin;
  }
  get estado(): EstadoTurno {
    return this.props.estado;
  }
  get motivoConsulta(): string | null {
    return this.props.motivoConsulta;
  }
  get creadoPor(): string {
    return this.props.creadoPor;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get estaReservado(): boolean {
    return this.props.estado === EstadoTurno.RESERVADO;
  }

  cancelar(ahora: Date): void {
    if (this.props.estado !== EstadoTurno.RESERVADO) {
      throw new TurnoNoCancelable(this.props.estado);
    }
    this.props.estado = EstadoTurno.CANCELADO;
    this.props.updatedAt = ahora;
  }

  atender(ahora: Date): void {
    if (this.props.estado !== EstadoTurno.RESERVADO) {
      throw new DatosDeTurnoInvalidos(
        `Solo se pueden atender turnos en estado RESERVADO (estado actual: ${this.props.estado})`,
      );
    }
    this.props.estado = EstadoTurno.ATENDIDO;
    this.props.updatedAt = ahora;
  }

  seSuperponeCon(otroInicio: Date, otroFin: Date): boolean {
    return this.props.inicio < otroFin && otroInicio < this.props.fin;
  }
}
