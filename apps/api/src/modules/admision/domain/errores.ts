import {
  Conflicto,
  ErrorDeValidacion,
  NoEncontrado,
  Prohibido,
} from '../../../building-blocks/domain';

export class PacienteYaExiste extends Conflicto {
  constructor(documento: string) {
    super(
      `El paciente con documento ${documento} ya se encuentra registrado`,
      'DOCUMENTO_DUPLICADO',
    );
  }
}

export class PacienteNoEncontrado extends NoEncontrado {
  constructor(id?: string) {
    super(id ? `Paciente ${id} no encontrado` : 'Paciente no encontrado', 'PACIENTE_NO_ENCONTRADO');
  }
}

export class MedicoNoEncontrado extends NoEncontrado {
  constructor(id?: string) {
    super(id ? `Médico ${id} no encontrado` : 'Médico no encontrado', 'MEDICO_NO_ENCONTRADO');
  }
}

export class MedicoYaExiste extends Conflicto {
  constructor(matricula: string) {
    super(`Ya existe un médico con la matrícula ${matricula}`, 'MATRICULA_DUPLICADA');
  }
}

export class FranjasSolapadas extends Conflicto {
  constructor() {
    super(
      'Las franjas horarias de la agenda no pueden solaparse en el mismo día',
      'FRANJAS_SOLAPADAS',
    );
  }
}

export class FranjaHorariaInvalida extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'FRANJA_HORARIA_INVALIDA');
  }
}

export class TurnoFueraDeAgenda extends ErrorDeValidacion {
  constructor() {
    super(
      'El horario solicitado está fuera de la agenda de atención del médico',
      'TURNO_FUERA_DE_AGENDA',
    );
  }
}

export class FranjaOcupada extends Conflicto {
  constructor() {
    super('El médico ya tiene un turno reservado en ese horario', 'FRANJA_OCUPADA');
  }
}

export class TurnoNoCancelable extends Conflicto {
  constructor(estadoActual: string) {
    super(
      `No se puede cancelar el turno porque no está reservado (estado actual: ${estadoActual})`,
      'TURNO_NO_CANCELABLE',
    );
  }
}

export class TurnoNoEncontrado extends NoEncontrado {
  constructor(id?: string) {
    super(id ? `Turno ${id} no encontrado` : 'Turno no encontrado', 'TURNO_NO_ENCONTRADO');
  }
}

export class NivelTriajeInvalido extends ErrorDeValidacion {
  constructor() {
    super(
      'El nivel de triaje es obligatorio y debe ser válido (ROJO, NARANJA, AMARILLO, VERDE, AZUL)',
      'NIVEL_TRIAJE_INVALIDO',
    );
  }
}

export class TriajeNoEncontrado extends NoEncontrado {
  constructor(id?: string) {
    super(id ? `Triaje ${id} no encontrado` : 'Triaje no encontrado', 'TRIAJE_NO_ENCONTRADO');
  }
}

export class TurnoNoPerteneceAlPaciente extends Prohibido {
  constructor() {
    super(
      'No tiene permisos para modificar un turno que no le pertenece',
      'TURNO_NO_PERTENECE_AL_PACIENTE',
    );
  }
}
