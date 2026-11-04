import { Entity, generarId } from '../../../building-blocks/domain';

export type SeveridadAlergia = 'LEVE' | 'MODERADA' | 'GRAVE';

export class Alergia extends Entity {
  private constructor(
    id: string,
    readonly sustancia: string,
    readonly severidad: SeveridadAlergia,
    readonly registradoEn: Date,
    readonly registradoPor: string,
  ) {
    super(id);
  }

  static crear(sustancia: string, severidad: SeveridadAlergia, registradoEn: Date, registradoPor: string): Alergia {
    return new Alergia(generarId(), sustancia.trim(), severidad, registradoEn, registradoPor);
  }

  static reconstituir(id: string, sustancia: string, severidad: SeveridadAlergia, registradoEn: Date, registradoPor: string): Alergia {
    return new Alergia(id, sustancia, severidad, registradoEn, registradoPor);
  }
}

export class AntecedenteFamiliar extends Entity {
  private constructor(
    id: string,
    readonly parentesco: string,
    readonly condicion: string,
    readonly registradoEn: Date,
    readonly registradoPor: string,
  ) {
    super(id);
  }

  static crear(parentesco: string, condicion: string, registradoEn: Date, registradoPor: string): AntecedenteFamiliar {
    return new AntecedenteFamiliar(generarId(), parentesco.trim(), condicion.trim(), registradoEn, registradoPor);
  }

  static reconstituir(id: string, parentesco: string, condicion: string, registradoEn: Date, registradoPor: string): AntecedenteFamiliar {
    return new AntecedenteFamiliar(id, parentesco, condicion, registradoEn, registradoPor);
  }
}

export class Evolucion extends Entity {
  private constructor(
    id: string,
    readonly medicoId: string,
    readonly motivo: string,
    readonly diagnostico: string,
    readonly registradoEn: Date,
    readonly tratamiento?: string,
    readonly turnoId?: string,
    readonly internacionId?: string,
  ) {
    super(id);
  }

  static crear(
    medicoId: string,
    motivo: string,
    diagnostico: string,
    registradoEn: Date,
    tratamiento?: string,
    turnoId?: string,
    internacionId?: string,
  ): Evolucion {
    return new Evolucion(
      generarId(),
      medicoId,
      motivo.trim(),
      diagnostico.trim(),
      registradoEn,
      tratamiento?.trim(),
      turnoId,
      internacionId,
    );
  }

  static reconstituir(
    id: string,
    medicoId: string,
    motivo: string,
    diagnostico: string,
    registradoEn: Date,
    tratamiento?: string,
    turnoId?: string,
    internacionId?: string,
  ): Evolucion {
    return new Evolucion(id, medicoId, motivo, diagnostico, registradoEn, tratamiento, turnoId, internacionId);
  }
}

export type EstadoPrescripcion = 'ACTIVA' | 'SUSPENDIDA' | 'FINALIZADA';

export class Prescripcion extends Entity {
  private constructor(
    id: string,
    readonly medicoId: string,
    readonly medicamento: string,
    readonly dosis: string,
    readonly frecuenciaHoras: number,
    readonly duracionDias: number,
    readonly estado: EstadoPrescripcion,
    readonly creadoEn: Date,
    readonly evolucionId?: string,
  ) {
    super(id);
  }

  static crear(
    medicoId: string,
    medicamento: string,
    dosis: string,
    frecuenciaHoras: number,
    duracionDias: number,
    creadoEn: Date,
    evolucionId?: string,
  ): Prescripcion {
    return new Prescripcion(
      generarId(),
      medicoId,
      medicamento.trim(),
      dosis.trim(),
      frecuenciaHoras,
      duracionDias,
      'ACTIVA',
      creadoEn,
      evolucionId,
    );
  }

  static reconstituir(
    id: string,
    medicoId: string,
    medicamento: string,
    dosis: string,
    frecuenciaHoras: number,
    duracionDias: number,
    estado: EstadoPrescripcion,
    creadoEn: Date,
    evolucionId?: string,
  ): Prescripcion {
    return new Prescripcion(id, medicoId, medicamento, dosis, frecuenciaHoras, duracionDias, estado, creadoEn, evolucionId);
  }
}

export type TipoEstudio = 'LABORATORIO' | 'IMAGEN' | 'OTRO';

export class Estudio extends Entity {
  private constructor(
    id: string,
    readonly tipo: TipoEstudio,
    readonly descripcion: string,
    readonly fecha: Date,
    readonly registradoPor: string,
    readonly creadoEn: Date,
    readonly resultado?: string,
  ) {
    super(id);
  }

  static crear(
    tipo: TipoEstudio,
    descripcion: string,
    fecha: Date,
    registradoPor: string,
    creadoEn: Date,
    resultado?: string,
  ): Estudio {
    return new Estudio(generarId(), tipo, descripcion.trim(), fecha, registradoPor, creadoEn, resultado?.trim());
  }

  static reconstituir(
    id: string,
    tipo: TipoEstudio,
    descripcion: string,
    fecha: Date,
    registradoPor: string,
    creadoEn: Date,
    resultado?: string,
  ): Estudio {
    return new Estudio(id, tipo, descripcion, fecha, registradoPor, creadoEn, resultado);
  }
}

