import { RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { AbrirHistoriaCommand } from './abrir-historia.command';
import { AbrirHistoriaHandler } from './abrir-historia.handler';

describe('HCE-01: Abrir historia (idempotente por evento)', () => {
  const pacienteId = 'paciente-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;
  let reloj: RelojFijo;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  it('debería abrir la historia clínica y no duplicar si el evento llega dos veces', async () => {
    const handler = new AbrirHistoriaHandler(repo, reloj);

    const res1 = await handler.ejecutar(new AbrirHistoriaCommand(pacienteId, 'evento-1'));
    const res2 = await handler.ejecutar(new AbrirHistoriaCommand(pacienteId, 'evento-1'));

    expect(res1.id).toBe(res2.id);
    const guardada = await repo.buscarPorPacienteId(pacienteId);
    expect(guardada).toBeDefined();
  });
});
