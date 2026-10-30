import { Entity, generarId, type Id } from '../../../building-blocks/domain';
import { TextoNotaRequerido } from './errores';

export interface PropsCrearNotaEnfermeria {
  readonly id?: string;
  readonly pacienteId: string;
  readonly internacionId?: string | null;
  readonly texto: string;
  readonly registradoEn?: Date;
  readonly registradoPor: string;
}

export interface PropsNotaEnfermeria {
  readonly pacienteId: string;
  readonly internacionId: string | null;
  readonly texto: string;
  readonly registradoEn: Date;
  readonly registradoPor: string;
}

/**
 * NotaDeEnfermeria (Entidad inmutable).
 * Registra observaciones clínicas y de cuidado realizadas por el personal de enfermería.
 */
export class NotaDeEnfermeria extends Entity<Id> {
  readonly pacienteId: string;
  readonly internacionId: string | null;
  readonly texto: string;
  readonly registradoEn: Date;
  readonly registradoPor: string;

  private constructor(id: Id, props: PropsNotaEnfermeria) {
    super(id);
    this.pacienteId = props.pacienteId;
    this.internacionId = props.internacionId;
    this.texto = props.texto;
    this.registradoEn = props.registradoEn;
    this.registradoPor = props.registradoPor;
  }

  static crear(props: PropsCrearNotaEnfermeria): NotaDeEnfermeria {
    if (!props.texto || !props.texto.trim()) {
      throw new TextoNotaRequerido();
    }

    return new NotaDeEnfermeria(props.id ?? generarId(), {
      pacienteId: props.pacienteId,
      internacionId: props.internacionId ?? null,
      texto: props.texto.trim(),
      registradoEn: props.registradoEn ?? new Date(),
      registradoPor: props.registradoPor,
    });
  }

  static reconstituir(id: Id, props: PropsNotaEnfermeria): NotaDeEnfermeria {
    return new NotaDeEnfermeria(id, props);
  }
}

