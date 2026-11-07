import { ErrorDeValidacion, ValueObject } from '../../../building-blocks/domain';
import { TipoDocumento } from './tipos';

export class DocumentoInvalido extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'DOCUMENTO_INVALIDO');
  }
}

interface DocumentoProps extends Record<string, unknown> {
  tipo: TipoDocumento;
  numero: string;
}

export class Documento extends ValueObject<DocumentoProps> {
  private constructor(props: DocumentoProps) {
    super(props);
  }

  static crear(tipo: TipoDocumento, numero: string): Documento {
    if (!tipo || !Object.values(TipoDocumento).includes(tipo)) {
      throw new DocumentoInvalido('El tipo de documento es requerido y debe ser válido');
    }
    const limpio = numero?.trim() ?? '';
    if (limpio.length === 0) {
      throw new DocumentoInvalido('El número de documento no puede estar vacío');
    }
    if (limpio.length > 20) {
      throw new DocumentoInvalido('El número de documento no puede superar los 20 caracteres');
    }
    return new Documento({ tipo, numero: limpio });
  }

  get tipo(): TipoDocumento {
    return this.props.tipo;
  }

  get numero(): string {
    return this.props.numero;
  }

  override toString(): string {
    return `${this.tipo} ${this.numero}`;
  }
}
