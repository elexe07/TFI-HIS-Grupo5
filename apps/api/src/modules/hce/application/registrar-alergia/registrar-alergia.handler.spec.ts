import { RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { RegistrarAlergiaCommand } from './registrar-alergia.command';
import { RegistrarAlergiaHandler } from './registrar-alergia.handler';

describe('HCE-03: Registrar alergia', () => {
  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;
  let reloj: RelojFijo;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  it('debería registrar una alergia y lanzar error si está duplicada', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new RegistrarAlergiaHandler(repo, reloj);
    await handler.ejecutar(
      new RegistrarAlergiaCommand(pacienteId, 'Amoxicilina', 'GRAVE', medicoId),
    );

    await expect(
      handler.ejecutar(
        new RegistrarAlergiaCommand(pacienteId, 'amoxicilina', 'MODERADA', medicoId),
      ),
    ).rejects.toThrow("La sustancia 'amoxicilina' ya está registrada");
  });
});
