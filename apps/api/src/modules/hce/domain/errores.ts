import {
  Conflicto,
  ErrorDeValidacion,
  NoEncontrado,
  Prohibido,
} from '../../../building-blocks/domain';

export class HistoriaClinicaNoEncontrada extends NoEncontrado {
  constructor(criterio = '') {
    super(
      `No se encontró la historia clínica ${criterio}`.trim(),
      'HISTORIA_CLINICA_NO_ENCONTRADA',
    );
  }
}

export class HistoriaClinicaYaExiste extends Conflicto {
  constructor(pacienteId: string) {
    super(`El paciente ${pacienteId} ya tiene una historia clínica`, 'HISTORIA_CLINICA_YA_EXISTE');
  }
}

export class AlergiaDuplicada extends Conflicto {
  constructor(sustancia: string) {
    super(
      `La sustancia '${sustancia}' ya está registrada como alergia en esta historia`,
      'ALERGIA_DUPLICADA',
    );
  }
}

export class PacienteAlergicoAMedicamento extends Conflicto {
  constructor(medicamento: string) {
    super(
      `No se puede prescribir: el paciente presenta alergia a '${medicamento}'`,
      'PACIENTE_ALERGICO',
    );
  }
}

export class ParametroInvalidoHCE extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'HCE_PARAMETRO_INVALIDO');
  }
}

export class AccesoProhibidoHistoria extends Prohibido {
  constructor() {
    super('No tiene permisos para acceder a esta historia clínica', 'HCE_ACCESO_PROHIBIDO');
  }
}
