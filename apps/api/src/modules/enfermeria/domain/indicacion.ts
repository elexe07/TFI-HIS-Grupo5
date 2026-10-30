import { AggregateRoot, generarId, type Id } from '../../../building-blocks/domain';
import { AdministracionDeMedicacion } from './administracion-medicacion';
import { IndicacionNoEstaPendiente, MotivoOmisionRequerido } from './errores';
import { ESTADOS_INDICACION, type EstadoIndicacion } from './estado-indicacion';
import { MedicacionAdministradaEvent } from './events/medicacion-administrada.event';

export interface PropsCrearIndicacion {
  readonly id?: string;
  readonly internacionId: string;
  readonly pacienteId: string;
  readonly prescripcionId: string;
  readonly descripcion: string;
  readonly programadaPara: Date;
  readonly createdAt?: Date;
}

export interface PropsIndicacion {
  readonly internacionId: string;
  readonly pacienteId: string;
  readonly prescripcionId: string;
  readonly descripcion: string;
  readonly programadaPara: Date;
  readonly estado: EstadoIndicacion;
  readonly motivoOmision: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Agregado Indicacion: representa una indicación médica programada (dosis de medicación).
 * Ciclo de vida: PENDIENTE -> EJECUTADA o PENDIENTE -> OMITIDA.
 */
export class Indicacion extends AggregateRoot<Id> {
  readonly internacionId: string;
  readonly pacienteId: string;
  readonly prescripcionId: string;
  readonly descripcion: string;
  readonly programadaPara: Date;
  private _estado: EstadoIndicacion;
  private _motivoOmision: string | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(id: Id, props: PropsIndicacion) {
    super(id);
    this.internacionId = props.internacionId;
    this.pacienteId = props.pacienteId;
    this.prescripcionId = props.prescripcionId;
    this.descripcion = props.descripcion;
    this.programadaPara = props.programadaPara;
    this._estado = props.estado;
    this._motivoOmision = props.motivoOmision;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get estado(): EstadoIndicacion {
    return this._estado;
  }

  get motivoOmision(): string | null {
    return this._motivoOmision;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static crear(props: PropsCrearIndicacion): Indicacion {
    const id = props.id ?? generarId();
    const ahora = props.createdAt ?? new Date();

    return new Indicacion(id, {
      internacionId: props.internacionId,
      pacienteId: props.pacienteId,
      prescripcionId: props.prescripcionId,
      descripcion: props.descripcion.trim(),
      programadaPara: props.programadaPara,
      estado: ESTADOS_INDICACION.PENDIENTE,
      motivoOmision: null,
      createdAt: ahora,
      updatedAt: ahora,
    });
  }

  static reconstituir(id: Id, props: PropsIndicacion): Indicacion {
    return new Indicacion(id, props);
  }

  administrar(administradaPor: string, administradaEn: Date, administracionId?: string): AdministracionDeMedicacion {
    if (this._estado !== ESTADOS_INDICACION.PENDIENTE) {
      throw new IndicacionNoEstaPendiente(this.id, this._estado);
    }

    this._estado = ESTADOS_INDICACION.EJECUTADA;
    this._updatedAt = administradaEn;

    const administracion = AdministracionDeMedicacion.crear(
      {
        indicacionId: this.id,
        pacienteId: this.pacienteId,
        medicamento: this.descripcion,
        administradaEn,
        administradaPor,
      },
      administracionId,
    );

    this.registrarEvento(
      new MedicacionAdministradaEvent(
        {
          administracionId: administracion.id,
          indicacionId: this.id,
          pacienteId: this.pacienteId,
          internacionId: this.internacionId,
          medicamento: this.descripcion,
          administradaPor,
        },
        administradaEn,
      ),
    );

    return administracion;
  }

  omitir(motivo: string, omitidaEn: Date): void {
    if (this._estado !== ESTADOS_INDICACION.PENDIENTE) {
      throw new IndicacionNoEstaPendiente(this.id, this._estado);
    }

    if (!motivo || !motivo.trim()) {
      throw new MotivoOmisionRequerido();
    }

    this._estado = ESTADOS_INDICACION.OMITIDA;
    this._motivoOmision = motivo.trim();
    this._updatedAt = omitidaEn;
  }
}
