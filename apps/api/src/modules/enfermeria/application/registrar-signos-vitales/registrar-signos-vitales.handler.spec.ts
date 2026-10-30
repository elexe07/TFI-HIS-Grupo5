import { RelojFijo } from '../../../../building-blocks/testing';
import { TemperaturaInvalida } from '../../domain/errores';
import { SignosVitalesRepositoryEnMemoria } from '../../testing/signos-vitales.repository.en-memoria';
import { RegistrarSignosVitalesCommand } from './registrar-signos-vitales.command';
import { RegistrarSignosVitalesHandler } from './registrar-signos-vitales.handler';

describe('RegistrarSignosVitalesHandler', () => {
  let repo: SignosVitalesRepositoryEnMemoria;
  let reloj: RelojFijo;
  let handler: RegistrarSignosVitalesHandler;

  beforeEach(() => {
    repo = new SignosVitalesRepositoryEnMemoria();
    reloj = new RelojFijo(new Date('2026-10-23T11:00:00Z'));
    handler = new RegistrarSignosVitalesHandler(repo, reloj);
  });

  it('registra los signos vitales correctamente usando la hora del reloj', async () => {
    const cmd = new RegistrarSignosVitalesCommand('pac-1', 'enf-1', {
      internacionId: 'intern-1',
      temperatura: 36.5,
      presionSistolica: 120,
      presionDiastolica: 80,
      frecuenciaCardiaca: 70,
      saturacionO2: 99,
    });

    const resultado = await handler.ejecutar(cmd);

    expect(resultado.pacienteId).toBe('pac-1');
    expect(resultado.temperatura).toBe(36.5);
    expect(resultado.registradoEn).toEqual(reloj.ahora());
    expect(resultado.registradoPor).toBe('enf-1');

    const lista = await repo.listar({ pacienteId: 'pac-1' });
    expect(lista).toHaveLength(1);
  });

  it('falla y no persiste si los datos violan las reglas de dominio', async () => {
    const cmd = new RegistrarSignosVitalesCommand('pac-1', 'enf-1', {
      temperatura: 25.0, // menor a 30 °C
    });

    await expect(handler.ejecutar(cmd)).rejects.toThrow(TemperaturaInvalida);
    expect(await repo.listar({ pacienteId: 'pac-1' })).toHaveLength(0);
  });
});

