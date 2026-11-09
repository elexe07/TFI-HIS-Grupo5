import { Conflicto, ErrorDeValidacion, NoEncontrado } from '../../../building-blocks/domain';

export class TransicionDeCamaInvalida extends Conflicto {
  constructor(desde: string, hacia: string) {
    super(
      `No se permite la transición de estado de cama desde '${desde}' hacia '${hacia}'`,
      'TRANSICION_CAMA_INVALIDA',
    );
  }
}

export class CamaNoLibre extends Conflicto {
  constructor(camaId: string, estadoActual: string) {
    super(
      `La cama '${camaId}' no está libre para internar (estado actual: '${estadoActual}')`,
      'CAMA_NO_LIBRE',
    );
  }
}

export class PacienteYaInternado extends Conflicto {
  constructor(pacienteId: string) {
    super(
      `El paciente '${pacienteId}' ya posee una internación activa`,
      'PACIENTE_YA_INTERNADO',
    );
  }
}

export class InternacionYaFinalizada extends Conflicto {
  constructor(internacionId: string) {
    super(
      `La internación '${internacionId}' ya ha sido finalizada previamente`,
      'INTERNACION_YA_FINALIZADA',
    );
  }
}

export class StockInsuficiente extends Conflicto {
  constructor(insumoId: string, stockActual: number, cantidadRequerida: number) {
    super(
      `Stock insuficiente para el insumo '${insumoId}'. Actual: ${stockActual}, solicitado: ${cantidadRequerida}`,
      'STOCK_INSUFICIENTE',
    );
  }
}

export class CantidadInvalida extends ErrorDeValidacion {
  constructor(mensaje = 'La cantidad debe ser un entero positivo mayor a cero') {
    super(mensaje, 'CANTIDAD_INVALIDA');
  }
}

export class CamaNoEncontrada extends NoEncontrado {
  constructor(id: string) {
    super(`Cama con id '${id}' no encontrada`, 'CAMA_NO_ENCONTRADA');
  }
}

export class InternacionNoEncontrada extends NoEncontrado {
  constructor(id: string) {
    super(`Internación con id '${id}' no encontrada`, 'INTERNACION_NO_ENCONTRADA');
  }
}

export class InsumoNoEncontrado extends NoEncontrado {
  constructor(criterio: string) {
    super(`Insumo '${criterio}' no encontrado`, 'INSUMO_NO_ENCONTRADO');
  }
}
