import { RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { RegistrarAntecedenteCommand } from './registrar-antecedente.command';
import { RegistrarAntecedenteHandler } from './registrar-antecedente.handler';

describe('HCE-04: Registrar antecedente familiar', () => {
  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;
  let reloj: RelojFijo;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  it('debería registrar un antecedente familiar', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new RegistrarAntecedenteHandler(repo, reloj);
    const res = await handler.ejecutar(
      new RegistrarAntecedenteCommand(pacienteId, 'Padre', 'Diabetes Tipo 2', medicoId),
    );

    expect(res.id).toBeDefined();
  });
});
