export const DIRECTORIO_DE_PACIENTES = Symbol('DIRECTORIO_DE_PACIENTES');

/**
 * Puerto: Facturación necesita saber qué paciente es el usuario logueado (portal del paciente),
 * pero las fichas de pacientes son de Admisión. El adaptador se lo pregunta a Admisión.
 */
export interface DirectorioDePacientes {
  /** Id de la ficha de paciente vinculada al usuario, o `null` si no tiene. */
  pacienteIdDelUsuario(usuarioId: string): Promise<string | null>;
}
