import { DatosDeMedicoInvalidos, Medico } from './medico';

describe('Medico', () => {
  const ahora = new Date('2026-10-23T10:00:00Z');

  it('debería crearse correctamente con datos válidos', () => {
    const medico = Medico.crear(
      {
        usuarioId: 'u-123',
        matricula: 'MN-9988',
        nombre: ' Carlos ',
        apellido: ' González ',
        especialidad: ' Cardiología ',
      },
      ahora,
    );

    expect(medico.id).toBeDefined();
    expect(medico.usuarioId).toBe('u-123');
    expect(medico.matricula).toBe('MN-9988');
    expect(medico.nombre).toBe('Carlos');
    expect(medico.apellido).toBe('González');
    expect(medico.especialidad).toBe('Cardiología');
    expect(medico.nombreCompleto).toBe('Dr. Carlos González');
  });

  it('debería fallar si falta la matrícula', () => {
    expect(() =>
      Medico.crear(
        {
          usuarioId: 'u-123',
          matricula: '   ',
          nombre: 'Carlos',
          apellido: 'González',
          especialidad: 'Cardiología',
        },
        ahora,
      ),
    ).toThrow(DatosDeMedicoInvalidos);
  });
});
