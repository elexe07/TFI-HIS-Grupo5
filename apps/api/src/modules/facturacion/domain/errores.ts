import { Conflicto, ErrorDeValidacion, NoEncontrado } from '../../../building-blocks/domain';

export class CuentaNoEncontrada extends NoEncontrado {
  constructor(mensaje = 'La cuenta solicitada no existe') {
    super(mensaje, 'CUENTA_NO_ENCONTRADA');
  }
}

export class TarifaNoEncontrada extends NoEncontrado {
  constructor(concepto: string) {
    super(`No se encontró la tarifa vigente para el concepto ${concepto}`, 'TARIFA_NO_ENCONTRADA');
  }
}

export class ObraSocialNoEncontrada extends NoEncontrado {
  constructor(codigo: string) {
    super(`No se encontró la obra social con código ${codigo}`, 'OBRA_SOCIAL_NO_ENCONTRADA');
  }
}

export class CuentaYaCerrada extends Conflicto {
  constructor(mensaje = 'No se pueden agregar cargos a una cuenta cerrada') {
    super(mensaje, 'CUENTA_YA_CERRADA');
  }
}

export class CargoDuplicado extends Conflicto {
  constructor(origenEventoId: string) {
    super(`El evento ${origenEventoId} ya originó un cargo en esta cuenta`, 'CARGO_DUPLICADO');
  }
}

export class CoberturaRechazada extends ErrorDeValidacion {
  constructor(motivo: string) {
    super(`Validación de cobertura rechazada: ${motivo}`, 'COBERTURA_RECHAZADA');
  }
}
