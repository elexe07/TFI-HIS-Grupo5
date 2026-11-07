import { AggregateRoot, ErrorDeValidacion, generarId } from '../../../building-blocks/domain';
import { Cobertura } from './cobertura';
import { Documento } from './documento';
import { PacienteRegistrado } from './events/paciente-registrado';
import { Sexo } from './tipos';

export class DatosDePacienteInvalidos extends ErrorDeValidacion {
  constructor(mensaje: string) {
    super(mensaje, 'DATOS_PACIENTE_INVALIDOS');
  }
}

export interface PropsPaciente {
  usuarioId: string | null;
  documento: Documento;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  sexo: Sexo;
  telefono: string | null;
  email: string | null;
  cobertura: Cobertura;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface CrearPacienteDatos {
  usuarioId?: string | null;
  documento: Documento;
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  sexo: Sexo;
  telefono?: string | null;
  email?: string | null;
  cobertura?: Cobertura;
}

function exigirTexto(valor: string | undefined, mensaje: string): string {
  const limpio = valor?.trim() ?? '';
  if (!limpio) throw new DatosDePacienteInvalidos(mensaje);
  return limpio;
}

function validarSexo(sexo: Sexo): Sexo {
  if (!sexo || !Object.values(Sexo).includes(sexo)) {
    throw new DatosDePacienteInvalidos('El sexo del paciente es obligatorio y debe ser F, M o X');
  }
  return sexo;
}

function validarFecha(fecha: Date, ahora: Date): Date {
  if (!fecha || isNaN(fecha.getTime())) {
    throw new DatosDePacienteInvalidos('La fecha de nacimiento es inválida');
  }
  if (fecha > ahora) {
    throw new DatosDePacienteInvalidos('La fecha de nacimiento no puede ser futura');
  }
  return fecha;
}

function asignarTextoOpcional(
  actual: string | null,
  nuevo: string | null | undefined,
): string | null {
  if (nuevo === undefined) return actual;
  if (nuevo === null) return null;
  const limpio = nuevo.trim();
  return limpio.length > 0 ? limpio : null;
}

export class Paciente extends AggregateRoot {
  private constructor(
    id: string,
    private readonly props: PropsPaciente,
  ) {
    super(id);
  }

  static crear(datos: CrearPacienteDatos, ahora: Date): Paciente {
    const nombre = exigirTexto(datos.nombre, 'El nombre del paciente es obligatorio');
    const apellido = exigirTexto(datos.apellido, 'El apellido del paciente es obligatorio');
    const sexo = validarSexo(datos.sexo);
    const fechaNacimiento = validarFecha(datos.fechaNacimiento, ahora);

    const paciente = new Paciente(generarId(), {
      usuarioId: datos.usuarioId ?? null,
      documento: datos.documento,
      nombre,
      apellido,
      fechaNacimiento,
      sexo,
      telefono: datos.telefono?.trim() || null,
      email: datos.email?.trim() || null,
      cobertura: datos.cobertura ?? Cobertura.particular(),
      creadoEn: ahora,
      actualizadoEn: ahora,
    });

    paciente.registrarEvento(new PacienteRegistrado(paciente.id, ahora));
    return paciente;
  }

  static reconstituir(id: string, props: PropsPaciente): Paciente {
    return new Paciente(id, props);
  }

  get usuarioId(): string | null {
    return this.props.usuarioId;
  }
  get documento(): Documento {
    return this.props.documento;
  }
  get nombre(): string {
    return this.props.nombre;
  }
  get apellido(): string {
    return this.props.apellido;
  }
  get fechaNacimiento(): Date {
    return this.props.fechaNacimiento;
  }
  get sexo(): Sexo {
    return this.props.sexo;
  }
  get telefono(): string | null {
    return this.props.telefono;
  }
  get email(): string | null {
    return this.props.email;
  }
  get cobertura(): Cobertura {
    return this.props.cobertura;
  }
  get creadoEn(): Date {
    return this.props.creadoEn;
  }
  get actualizadoEn(): Date {
    return this.props.actualizadoEn;
  }

  actualizar(
    datos: Partial<
      Pick<PropsPaciente, 'nombre' | 'apellido' | 'telefono' | 'email' | 'cobertura' | 'usuarioId'>
    >,
    ahora: Date,
  ): void {
    this.aplicarCambiosContacto(datos);
    if (datos.nombre !== undefined)
      this.props.nombre = exigirTexto(datos.nombre, 'El nombre no puede estar vacío');
    if (datos.apellido !== undefined)
      this.props.apellido = exigirTexto(datos.apellido, 'El apellido no puede estar vacío');
    this.props.actualizadoEn = ahora;
  }

  private aplicarCambiosContacto(
    datos: Partial<Pick<PropsPaciente, 'telefono' | 'email' | 'cobertura' | 'usuarioId'>>,
  ): void {
    this.props.telefono = asignarTextoOpcional(this.props.telefono, datos.telefono);
    this.props.email = asignarTextoOpcional(this.props.email, datos.email);
    if (datos.cobertura !== undefined) this.props.cobertura = datos.cobertura;
    if (datos.usuarioId !== undefined) this.props.usuarioId = datos.usuarioId;
  }
}
