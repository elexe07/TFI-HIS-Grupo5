/** Entrada del caso de uso: datos primitivos, sin lógica. */
export class CrearSaludoCommand {
  constructor(readonly destinatario: string) {}
}

export interface SaludoCreadoResultado {
  id: string;
  mensaje: string;
}
