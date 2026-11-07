import { AggregateRoot, ErrorDeValidacion, generarId } from '../../../building-blocks/domain';
import { NivelTriajeInvalido } from './errores';
import { EstadoTriaje, NivelTriaje, PRIORIDAD_TRIAJE } from './tipos';

export class DatosDeTriajeInvalidos extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'DATOS_TRIAJE_INVALIDOS');
  }
}

export interface PropsTriaje {
  pacienteId: string;
  nivel: NivelTriaje;
  motivo: string;
  estado: EstadoTriaje;
  llegadaEn: Date;
  registradoPor: string;
}

export interface CrearTriajeDatos {
  pacienteId: string;
  nivel: NivelTriaje;
  motivo: string;
  registradoPor: string;
  llegadaEn?: Date;
}

function validarId(id: string | undefined, campo: string): string {
  const limpio = id?.trim() ?? '';
  if (!limpio) throw new DatosDeTriajeInvalidos(`El ${campo} es obligatorio`);
  return limpio;
}

function validarNivel(nivel: NivelTriaje): NivelTriaje {
  if (!nivel || !Object.values(NivelTriaje).includes(nivel)) {
    throw new NivelTriajeInvalido();
  }
  return nivel;
}

export class Triaje extends AggregateRoot {
  private constructor(
    id: string,
    private readonly props: PropsTriaje,
  ) {
    super(id);
  }

  static crear(datos: CrearTriajeDatos, ahora: Date): Triaje {
    const pacienteId = validarId(datos.pacienteId, 'pacienteId');
    const registradoPor = validarId(datos.registradoPor, 'registradoPor');
    const nivel = validarNivel(datos.nivel);

    const motivo = datos.motivo?.trim() ?? '';
    if (motivo.length === 0)
      throw new DatosDeTriajeInvalidos('El motivo del triaje es obligatorio');

    return new Triaje(generarId(), {
      pacienteId,
      nivel,
      motivo,
      estado: EstadoTriaje.EN_ESPERA,
      llegadaEn: datos.llegadaEn ?? ahora,
      registradoPor,
    });
  }

  static reconstituir(id: string, props: PropsTriaje): Triaje {
    return new Triaje(id, props);
  }

  get pacienteId(): string {
    return this.props.pacienteId;
  }
  get nivel(): NivelTriaje {
    return this.props.nivel;
  }
  get motivo(): string {
    return this.props.motivo;
  }
  get estado(): EstadoTriaje {
    return this.props.estado;
  }
  get llegadaEn(): Date {
    return this.props.llegadaEn;
  }
  get registradoPor(): string {
    return this.props.registradoPor;
  }
  get prioridad(): number {
    return PRIORIDAD_TRIAJE[this.props.nivel];
  }

  marcarAtendido(): void {
    this.props.estado = EstadoTriaje.ATENDIDO;
  }

  static compararParaCola(a: Triaje, b: Triaje): number {
    if (a.prioridad !== b.prioridad) {
      return a.prioridad - b.prioridad;
    }
    return a.llegadaEn.getTime() - b.llegadaEn.getTime();
  }
}
