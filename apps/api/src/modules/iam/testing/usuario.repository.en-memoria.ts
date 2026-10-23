import type { Email } from '../domain/email';
import type { NombreRol } from '../domain/permisos';
import type { Usuario } from '../domain/usuario';
import type { UsuarioRepository } from '../domain/usuario.repository';

export class UsuarioRepositoryEnMemoria implements UsuarioRepository {
  private readonly usuarios = new Map<string, Usuario>();

  guardar(usuario: Usuario): Promise<void> {
    this.usuarios.set(usuario.id, usuario);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Usuario | null> {
    return Promise.resolve(this.usuarios.get(id) ?? null);
  }

  buscarPorEmail(email: Email): Promise<Usuario | null> {
    return Promise.resolve([...this.usuarios.values()].find((u) => u.email.equals(email)) ?? null);
  }

  listar(): Promise<Usuario[]> {
    return Promise.resolve([...this.usuarios.values()]);
  }

  contarActivosConRol(rol: NombreRol): Promise<number> {
    const n = [...this.usuarios.values()].filter((u) => u.activo && u.rol.nombre === rol).length;
    return Promise.resolve(n);
  }
}
