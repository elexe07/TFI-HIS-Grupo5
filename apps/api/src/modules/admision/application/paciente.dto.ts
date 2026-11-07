import type { Paciente } from '../domain/paciente';
import type { Sexo, TipoDocumento } from '../domain/tipos';

export interface PacienteDto {
  id: string;
  usuarioId: string | null;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  sexo: Sexo;
  telefono: string | null;
  email: string | null;
  obraSocialCodigo: string | null;
  numeroAfiliado: string | null;
  createdAt: string;
  updatedAt: string;
}

export function aPacienteDto(p: Paciente): PacienteDto {
  return {
    id: p.id,
    usuarioId: p.usuarioId,
    tipoDocumento: p.documento.tipo,
    numeroDocumento: p.documento.numero,
    nombre: p.nombre,
    apellido: p.apellido,
    fechaNacimiento: p.fechaNacimiento.toISOString().slice(0, 10),
    sexo: p.sexo,
    telefono: p.telefono,
    email: p.email,
    obraSocialCodigo: p.cobertura.obraSocialCodigo,
    numeroAfiliado: p.cobertura.numeroAfiliado,
    createdAt: p.creadoEn.toISOString(),
    updatedAt: p.actualizadoEn.toISOString(),
  };
}

