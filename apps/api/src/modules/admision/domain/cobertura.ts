import { ValueObject } from '../../../building-blocks/domain';

interface CoberturaProps extends Record<string, unknown> {
  obraSocialCodigo: string | null;
  numeroAfiliado: string | null;
}

export class Cobertura extends ValueObject<CoberturaProps> {
  private constructor(props: CoberturaProps) {
    super(props);
  }

  static crear(obraSocialCodigo?: string | null, numeroAfiliado?: string | null): Cobertura {
    const osLimpio = obraSocialCodigo?.trim() || null;
    const afiliadoLimpio = numeroAfiliado?.trim() || null;
    return new Cobertura({
      obraSocialCodigo: osLimpio,
      numeroAfiliado: afiliadoLimpio,
    });
  }

  static particular(): Cobertura {
    return new Cobertura({
      obraSocialCodigo: 'PARTICULAR',
      numeroAfiliado: null,
    });
  }

  get obraSocialCodigo(): string | null {
    return this.props.obraSocialCodigo;
  }

  get numeroAfiliado(): string | null {
    return this.props.numeroAfiliado;
  }
}
