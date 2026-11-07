import { Entity, ErrorDeValidacion, generarId } from '../../../building-blocks/domain';

export class DatosDeMedicoInvalidos extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'DATOS_MEDICO_INVALIDOS');
  }
}

export interface PropsMedico {
  usuarioId: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
  creadoEn: Date;
}

export interface CrearMedicoDatos {
  usuarioId: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
}

function exigir(valor: string | undefined, mensaje: string): string {
  const limpio = valor?.trim() ?? '';
  if (!limpio) throw new DatosDeMedicoInvalidos(mensaje);
  return limpio;
}

function validarDatosMedico(datos: CrearMedicoDatos) {
  return {
    usuarioId: exigir(datos.usuarioId, 'El usuarioId es obligatorio'),
    matricula: exigir(datos.matricula, 'La matrícula del médico es obligatoria'),
    nombre: exigir(datos.nombre, 'El nombre del médico es obligatorio'),
    apellido: exigir(datos.apellido, 'El apellido del médico es obligatorio'),
    especialidad: exigir(datos.especialidad, 'La especialidad del médico es obligatoria'),
  };
}

export class Medico extends Entity {
  private constructor(
    id: string,
    private readonly props: PropsMedico,
  ) {
    super(id);
  }

  static crear(datos: CrearMedicoDatos, ahora: Date): Medico {
    const limpios = validarDatosMedico(datos);

    return new Medico(generarId(), {
      ...limpios,
      creadoEn: ahora,
    });
  }

  static reconstituir(id: string, props: PropsMedico): Medico {
    return new Medico(id, props);
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get matricula(): string {
    return this.props.matricula;
  }

  get nombre(): string {
    return this.props.nombre;
  }

  get apellido(): string {
    return this.props.apellido;
  }

  get especialidad(): string {
    return this.props.especialidad;
  }

  get creadoEn(): Date {
    return this.props.creadoEn;
  }

  get nombreCompleto(): string {
    return `Dr. ${this.nombre} ${this.apellido}`;
  }
}

