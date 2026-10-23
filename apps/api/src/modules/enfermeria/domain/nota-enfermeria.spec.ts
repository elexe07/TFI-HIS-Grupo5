import { TextoNotaRequerido } from './errores';
import { NotaDeEnfermeria } from './nota-enfermeria';

describe('NotaDeEnfermeria', () => {
  it('se crea correctamente con texto válido', () => {
    const nota = NotaDeEnfermeria.crear({
      pacienteId: 'paciente-1',
      internacionId: 'internacion-1',
      texto: 'Paciente refiere dolor abdominal leve.',
      registradoPor: 'enfermero-1',
    });

    expect(nota.pacienteId).toBe('paciente-1');
    expect(nota.internacionId).toBe('internacion-1');
    expect(nota.texto).toBe('Paciente refiere dolor abdominal leve.');
    expect(nota.registradoPor).toBe('enfermero-1');
  });

  it('falla si el texto está vacío o contiene solo espacios', () => {
    expect(() =>
      NotaDeEnfermeria.crear({
        pacienteId: 'paciente-1',
        texto: '   ',
        registradoPor: 'enfermero-1',
      }),
    ).toThrow(TextoNotaRequerido);
  });
});

