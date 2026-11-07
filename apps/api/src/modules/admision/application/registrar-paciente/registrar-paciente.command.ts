import type { Sexo, TipoDocumento } from '../../domain/tipos';

export interface RegistrarPacienteDatos {
  usuarioId?: string | null;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // ISO date YYYY-MM-DD
  sexo: Sexo;
  telefono?: string | null;
  email?: string | null;
  obraSocialCodigo?: string | null;
  numeroAfiliado?: string | null;
}

export class RegistrarPacienteCommand {
  readonly usuarioId: string | null;
  readonly tipoDocumento: TipoDocumento;
  readonly numeroDocumento: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly fechaNacimiento: Date;
  readonly sexo: Sexo;
  readonly telefono: string | null;
  readonly email: string | null;
  readonly obraSocialCodigo: string | null;
  readonly numeroAfiliado: string | null;

  constructor(datos: RegistrarPacienteDatos) {
    this.usuarioId = datos.usuarioId ?? null;
    this.tipoDocumento = datos.tipoDocumento;
    this.numeroDocumento = datos.numeroDocumento;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.fechaNacimiento = new Date(datos.fechaNacimiento);
    this.sexo = datos.sexo;
    this.telefono = datos.telefono ?? null;
    this.email = datos.email ?? null;
    this.obraSocialCodigo = datos.obraSocialCodigo ?? null;
    this.numeroAfiliado = datos.numeroAfiliado ?? null;
  }
}

