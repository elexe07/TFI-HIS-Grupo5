import { RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { RegistrarEstudioCommand } from './registrar-estudio.command';
import { RegistrarEstudioHandler } from './registrar-estudio.handler';

describe('HCE-06: Registrar estudio', () => {
  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;
  let reloj: RelojFijo;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  it('debería registrar un estudio médico', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new RegistrarEstudioHandler(repo, reloj);
    const res = await handler.ejecutar(
      new RegistrarEstudioCommand(
        pacienteId,
        'IMAGEN',
        'Radiografía de tórax',
        new Date('2026-11-04'),
        medicoId,
        'Sin particularidades',
      ),
    );

    expect(res.id).toBeDefined();
  });
});
