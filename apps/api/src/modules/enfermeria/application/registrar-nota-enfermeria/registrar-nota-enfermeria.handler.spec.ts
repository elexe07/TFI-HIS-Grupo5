import { RelojFijo } from '../../../../building-blocks/testing';
import { TextoNotaRequerido } from '../../domain/errores';
import { NotaEnfermeriaRepositoryEnMemoria } from '../../testing/nota-enfermeria.repository.en-memoria';
import { RegistrarNotaEnfermeriaCommand } from './registrar-nota-enfermeria.command';
import { RegistrarNotaEnfermeriaHandler } from './registrar-nota-enfermeria.handler';

describe('RegistrarNotaEnfermeriaHandler', () => {
  let repo: NotaEnfermeriaRepositoryEnMemoria;
  let reloj: RelojFijo;
  let handler: RegistrarNotaEnfermeriaHandler;

  beforeEach(() => {
    repo = new NotaEnfermeriaRepositoryEnMemoria();
    reloj = new RelojFijo(new Date('2026-10-23T15:00:00Z'));
    handler = new RegistrarNotaEnfermeriaHandler(repo, reloj);
  });

  it('registra una nota de enfermería con hora del reloj', async () => {
    const cmd = new RegistrarNotaEnfermeriaCommand({
      pacienteId: 'pac-1',
      texto: 'Paciente descansando confortablemente.',
      registradoPor: 'enf-1',
      internacionId: 'intern-1',
    });

    const res = await handler.ejecutar(cmd);

    expect(res.pacienteId).toBe('pac-1');
    expect(res.internacionId).toBe('intern-1');
    expect(res.texto).toBe('Paciente descansando confortablemente.');
    expect(res.registradoPor).toBe('enf-1');
    expect(res.registradoEn).toEqual(reloj.ahora());

    const notas = await repo.listar({ pacienteId: 'pac-1' });
    expect(notas).toHaveLength(1);
  });

  it('falla si el texto de la nota está vacío', async () => {
    const cmd = new RegistrarNotaEnfermeriaCommand({
      pacienteId: 'pac-1',
      texto: '   ',
      registradoPor: 'enf-1',
    });

    await expect(handler.ejecutar(cmd)).rejects.toThrow(TextoNotaRequerido);
    expect(await repo.listar({ pacienteId: 'pac-1' })).toHaveLength(0);
  });
});
