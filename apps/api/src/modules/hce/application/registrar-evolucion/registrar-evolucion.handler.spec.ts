import { EventBusEnMemoria, RelojFijo } from '../../../../building-blocks/testing';
import { HistoriaClinica } from '../../domain/historia-clinica';
import { HistoriaClinicaRepositoryEnMemoria } from '../../testing';
import { RegistrarEvolucionCommand } from './registrar-evolucion.command';
import { RegistrarEvolucionHandler } from './registrar-evolucion.handler';

describe('HCE-02: Registrar evolución (inmutable, emite EvolucionRegistrada)', () => {
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

  it('debería registrar la evolución y emitir el evento para Facturación', async () => {
    await repo.guardar(HistoriaClinica.abrir(pacienteId, ahora));

    const handler = new RegistrarEvolucionHandler(repo, bus, reloj);
    const res = await handler.ejecutar(
      new RegistrarEvolucionCommand(
        pacienteId,
        medicoId,
        'Dolor de cabeza agudo',
        'Cefalea tensional',
        'Reposo e hidratación',
        'turno-1',
      ),
    );

    expect(res.id).toBeDefined();
    expect(bus.publicados).toHaveLength(1);
    expect(bus.publicados[0]?.nombre).toBe('hce.evolucion-registrada');
  });
});
