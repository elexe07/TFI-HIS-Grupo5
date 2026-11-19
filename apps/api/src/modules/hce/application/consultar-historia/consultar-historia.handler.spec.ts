import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { ConsultarHistoriaQuery } from './consultar-historia.query';
import { ConsultarHistoriaHandler } from './consultar-historia.handler';

describe('HCE-07: Consultar historia clínica', () => {
  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
  });

  it('médico puede consultar la historia completa', async () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    historia.registrarAlergia('Polen', 'LEVE', ahora, medicoId);
    await repo.guardar(historia);

    const handler = new ConsultarHistoriaHandler(repo);
    const resultado = await handler.ejecutar(
      new ConsultarHistoriaQuery(pacienteId, {
        id: medicoId,
        rol: 'MEDICO',
      }),
    );

    expect(resultado.pacienteId).toBe(pacienteId);
    expect(resultado.alergias).toHaveLength(1);
  });

  it('paciente no puede consultar historia de otro paciente', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new ConsultarHistoriaHandler(repo);
    await expect(
      handler.ejecutar(
        new ConsultarHistoriaQuery(pacienteId, {
          id: 'usuario-paciente-2',
          rol: 'PACIENTE',
          pacienteId: 'otro-paciente-id',
        }),
      ),
    ).rejects.toThrow('No tiene permisos para acceder');
  });
});
