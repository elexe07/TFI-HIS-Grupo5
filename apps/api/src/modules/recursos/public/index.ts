/**
 * Superficie pública del módulo Recursos y Camas.
 * Lo único que otros módulos pueden importar directamente.
 */
export const PACIENTE_INTERNADO = 'recursos.paciente-internado';
export const PACIENTE_DADO_DE_ALTA = 'recursos.paciente-dado-de-alta';

export {
  PacienteInternado,
  type PacienteInternadoProps,
} from '../domain/events/paciente-internado';
export {
  PacienteDadoDeAlta,
  type PacienteDadoDeAltaProps,
} from '../domain/events/paciente-dado-de-alta';
export { EstadoCama } from '../domain/cama';
export { EstadoInternacion } from '../domain/internacion';
