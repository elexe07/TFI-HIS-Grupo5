/**
 * Quién hace el pedido, visto desde un caso de uso. Lo arma el controller con el usuario del token.
 * Los casos de uso de lectura "propia" lo usan para que un paciente solo vea lo suyo.
 */
export interface Solicitante {
  readonly usuarioId: string;
  readonly esPaciente: boolean;
}

/** Arma el Solicitante a partir del usuario autenticado (`@UsuarioActual()`). */
export const solicitanteDe = (usuario: { id: string; rol: string }): Solicitante => ({
  usuarioId: usuario.id,
  esPaciente: usuario.rol === 'PACIENTE',
});
