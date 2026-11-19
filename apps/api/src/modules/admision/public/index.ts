export {
  EVENTO_PACIENTE_REGISTRADO,
  PacienteRegistrado,
} from '../domain/events/paciente-registrado';
export { EstadoTriaje, EstadoTurno, NivelTriaje, Sexo, TipoDocumento } from '../domain/tipos';
// "Mi ficha": otros módulos lo usan para filtrar lo propio cuando pide un paciente.
export { ObtenerPacienteDelUsuarioHandler } from '../application/obtener-paciente-del-usuario/obtener-paciente-del-usuario.handler';
export { ObtenerPacienteDelUsuarioQuery } from '../application/obtener-paciente-del-usuario/obtener-paciente-del-usuario.query';
export { PacienteNoVinculado } from '../domain/errores';
export { AdmisionModule } from '../admision.module';
