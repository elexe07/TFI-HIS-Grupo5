import { Cobertura } from './cobertura';
import { Documento } from './documento';
import { EVENTO_PACIENTE_REGISTRADO } from './events/paciente-registrado';
import { DatosDePacienteInvalidos, Paciente } from './paciente';
import { Sexo, TipoDocumento } from './tipos';

describe('Paciente', () => {
  const ahora = new Date('2026-10-23T10:00:00Z');
  const doc = Documento.crear(TipoDocumento.DNI, '35123456');
  const fechaNacimiento = new Date('1990-05-15');

  it('debería crearse correctamente y emitir PacienteRegistrado', () => {
    const paciente = Paciente.crear(
      {
        documento: doc,
        nombre: ' Juan ',
        apellido: ' Pérez ',
        fechaNacimiento,
        sexo: Sexo.M,
        telefono: '1122334455',
        email: 'juan@test.com',
        cobertura: Cobertura.crear('OSDE', '123456'),
      },
      ahora,
    );

    expect(paciente.id).toBeDefined();
    expect(paciente.nombre).toBe('Juan');
    expect(paciente.apellido).toBe('Pérez');
    expect(paciente.sexo).toBe(Sexo.M);
    expect(paciente.documento.equals(doc)).toBe(true);
    expect(paciente.cobertura.obraSocialCodigo).toBe('OSDE');

    const eventos = paciente.extraerEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.nombre).toBe(EVENTO_PACIENTE_REGISTRADO);
    expect((eventos[0] as unknown as { pacienteId: string })?.pacienteId).toBe(paciente.id);
  });

  it('debería fallar si el nombre está vacío', () => {
    expect(() =>
      Paciente.crear(
        {
          documento: doc,
          nombre: '   ',
          apellido: 'Pérez',
          fechaNacimiento,
          sexo: Sexo.M,
        },
        ahora,
      ),
    ).toThrow(DatosDePacienteInvalidos);
  });

  it('debería fallar si la fecha de nacimiento es futura', () => {
    const futura = new Date('2030-01-01');
    expect(() =>
      Paciente.crear(
        {
          documento: doc,
          nombre: 'Juan',
          apellido: 'Pérez',
          fechaNacimiento: futura,
          sexo: Sexo.M,
        },
        ahora,
      ),
    ).toThrow(DatosDePacienteInvalidos);
  });

  it('debería actualizar sus datos modificables', () => {
    const paciente = Paciente.crear(
      {
        documento: doc,
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento,
        sexo: Sexo.M,
      },
      ahora,
    );

    const despues = new Date('2026-10-23T11:00:00Z');
    paciente.actualizar({ telefono: '99998888', email: 'nuevo@mail.com' }, despues);

    expect(paciente.telefono).toBe('99998888');
    expect(paciente.email).toBe('nuevo@mail.com');
    expect(paciente.actualizadoEn).toEqual(despues);
  });
});

