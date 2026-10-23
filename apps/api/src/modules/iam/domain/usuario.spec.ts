import { Email } from './email';
import { PERMISOS } from './permisos';
import { Rol } from './rol';
import { NombreDeUsuarioInvalido, Usuario } from './usuario';

const AHORA = new Date('2026-01-01T10:00:00.000Z');
const medico = Rol.conPermisosPorDefecto('rol-medico', 'MEDICO');
const admin = Rol.conPermisosPorDefecto('rol-admin', 'ADMINISTRADOR');

const nuevo = (nombre = 'Ana') =>
  Usuario.crear(
    { email: Email.crear('ana@h.com'), nombre, passwordHash: 'hash', rol: medico },
    AHORA,
  );

describe('Usuario', () => {
  it('nace activo, con id y con el rol indicado', () => {
    const u = nuevo();
    expect(u.id).toHaveLength(36);
    expect(u.activo).toBe(true);
    expect(u.rol.nombre).toBe('MEDICO');
    expect(u.creadoEn).toEqual(AHORA);
  });

  it('recorta el nombre y rechaza uno vacío', () => {
    expect(nuevo('  Ana  ').nombre).toBe('Ana');
    expect(() => nuevo('   ')).toThrow(NombreDeUsuarioInvalido);
  });

  it('cambia de rol', () => {
    const u = nuevo();
    u.cambiarRol(admin);
    expect(u.rol.esAdministrador).toBe(true);
    expect(u.rol.tienePermiso(PERMISOS.USUARIOS_GESTIONAR)).toBe(true);
  });

  it('desactivado no puede iniciar sesión', () => {
    const u = nuevo();
    u.desactivar();
    expect(u.puedeIniciarSesion).toBe(false);
  });
});
