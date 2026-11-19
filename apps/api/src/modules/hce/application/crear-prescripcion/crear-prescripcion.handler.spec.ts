import { EventBusEnMemoria, RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { CrearPrescripcionCommand } from './crear-prescripcion.command';
import { CrearPrescripcionHandler } from './crear-prescripcion.handler';

describe('HCE-05: Crear prescripción (bloquea si hay alergia)', () => {
  const pacienteId = 'paciente-uuid-1';
  const medicoId = 'medico-uuid-1';
  const ahora = new Date('2026-11-04T10:00:00Z');

  let repo: HistoriaClinicaRepositoryEnMemoria;
  let bus: EventBusEnMemoria;
  let reloj: RelojFijo;

  beforeEach(() => {
    repo = new HistoriaClinicaRepositoryEnMemoria();
    bus = new EventBusEnMemoria();
    reloj = new RelojFijo(ahora);
  });

  it('debería bloquear si el paciente es alérgico', async () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    historia.registrarAlergia('Penicilina', 'GRAVE', ahora, medicoId);
    await repo.guardar(historia);

    const handler = new CrearPrescripcionHandler(repo, bus, reloj);

    await expect(
      handler.ejecutar(
        new CrearPrescripcionCommand(pacienteId, medicoId, 'Penicilina G', '1000 UI', 12, 7),
      ),
    ).rejects.toThrow('el paciente presenta alergia');
  });

  it('debería permitir prescribir si no es alérgico y emitir PrescripcionCreada', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new CrearPrescripcionHandler(repo, bus, reloj);
    const res = await handler.ejecutar(
      new CrearPrescripcionCommand(pacienteId, medicoId, 'Loratadina', '10 mg', 24, 10),
    );

    expect(res.id).toBeDefined();
    expect(bus.publicados).toHaveLength(1);
    expect(bus.publicados[0]?.nombre).toBe('hce.prescripcion-creada');
  });
});
