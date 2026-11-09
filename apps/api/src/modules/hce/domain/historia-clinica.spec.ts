import { HistoriaClinica } from './historia-clinica';
import { AlergiaDuplicada, PacienteAlergicoAMedicamento } from './errores';

describe('HistoriaClinica (Domain)', () => {
  const ahora = new Date('2026-11-04T12:00:00Z');
  const pacienteId = 'paciente-123';
  const medicoId = 'medico-456';

  it('debería abrir una historia clínica vacía', () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    expect(historia.id).toBeDefined();
    expect(historia.pacienteId).toBe(pacienteId);
    expect(historia.evoluciones).toHaveLength(0);
    expect(historia.alergias).toHaveLength(0);
    expect(historia.antecedentes).toHaveLength(0);
  });

  it('debería registrar una evolución y emitir EvolucionRegistrada', () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    const evolucion = historia.registrarEvolucion(
      medicoId,
      'Control rutinario',
      'Paciente sano',
      ahora,
      'Continuar dieta',
    );

    expect(historia.evoluciones).toHaveLength(1);
    expect(evolucion.motivo).toBe('Control rutinario');

    const eventos = historia.extraerEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]!.nombre).toBe('hce.evolucion-registrada');
  });

  it('debería registrar una alergia y fallar si está duplicada', () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    historia.registrarAlergia('Penicilina', 'GRAVE', ahora, medicoId);

    expect(historia.alergias).toHaveLength(1);

    expect(() => {
      historia.registrarAlergia('penicilina', 'MODERADA', ahora, medicoId);
    }).toThrow(AlergiaDuplicada);
  });

  it('debería bloquear la prescripción si el paciente tiene alergia', () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    historia.registrarAlergia('Ibuprofeno', 'MODERADA', ahora, medicoId);

    expect(() => {
      historia.crearPrescripcion(medicoId, 'Ibuprofeno 600mg', '600 mg', 8, 5, ahora);
    }).toThrow(PacienteAlergicoAMedicamento);
  });

  it('debería crear la prescripción y emitir PrescripcionCreada si no hay alergia', () => {
    const historia = HistoriaClinica.abrir(pacienteId, ahora);
    const pres = historia.crearPrescripcion(medicoId, 'Paracetamol', '500 mg', 8, 3, ahora);

    expect(historia.prescripciones).toHaveLength(1);
    expect(pres.medicamento).toBe('Paracetamol');

    const eventos = historia.extraerEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]!.nombre).toBe('hce.prescripcion-creada');
  });
});
