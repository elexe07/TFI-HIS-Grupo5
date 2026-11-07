export interface RegistrarMedicoDatos {
  usuarioId: string;
  matricula: string;
  nombre: string;
  apellido: string;
  especialidad: string;
}

export class RegistrarMedicoCommand {
  readonly usuarioId: string;
  readonly matricula: string;
  readonly nombre: string;
  readonly apellido: string;
  readonly especialidad: string;

  constructor(datos: RegistrarMedicoDatos) {
    this.usuarioId = datos.usuarioId;
    this.matricula = datos.matricula;
    this.nombre = datos.nombre;
    this.apellido = datos.apellido;
    this.especialidad = datos.especialidad;
  }
}

