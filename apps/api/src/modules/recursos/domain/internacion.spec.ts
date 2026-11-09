import { PacienteDadoDeAlta, PacienteInternado } from './eventos';
import { InternacionYaFinalizada } from './errores';
import { EstadoInternacion, Internacion } from './internacion';

describe('Internacion', () => {
  const internacionId = '44444444-4444-4444-4444-444444444444';
  const pacienteId = '55555555-5555-5555-5555-555555555555';
  const camaId = '66666666-6666-6666-6666-666666666666';
  const medicoId = '77777777-7777-7777-7777-777777777777';
  const ingresoEn = new Date('2026-10-20T10:00:00Z');

  it('debería crearse en estado ACTIVA y registrar el evento PacienteInternado', () => {
    const internacion = Internacion.crear({
      id: internacionId,
      pacienteId,
      camaId,
      medicoId,
      motivo: 'Neumonía',
      ingresoEn,
    });

    expect(internacion.id).toBe(internacionId);
    expect(internacion.pacienteId).toBe(pacienteId);
    expect(internacion.camaId).toBe(camaId);
    expect(internacion.medicoId).toBe(medicoId);
    expect(internacion.motivo).toBe('Neumonía');
    expect(internacion.estado).toBe(EstadoInternacion.ACTIVA);
    expect(internacion.egresoEn).toBeNull();

    const eventos = internacion.extraerEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toBeInstanceOf(PacienteInternado);
    const ev = eventos[0] as PacienteInternado;
    expect(ev.internacionId).toBe(internacionId);
    expect(ev.pacienteId).toBe(pacienteId);
    expect(ev.camaId).toBe(camaId);
    expect(ev.ingresoEn).toEqual(ingresoEn);
  });

  describe('Dar de alta', () => {
    it('debería cambiar estado a ALTA, registrar fecha de egreso y emitir PacienteDadoDeAlta', () => {
      const internacion = Internacion.crear({
        id: internacionId,
        pacienteId,
        camaId,
        medicoId,
        motivo: 'Observación',
        ingresoEn,
      });
      internacion.extraerEventos(); // Limpia evento inicial

      const egresoEn = new Date('2026-10-23T12:00:00Z');
      internacion.darDeAlta(egresoEn);

      expect(internacion.estado).toBe(EstadoInternacion.ALTA);
      expect(internacion.egresoEn).toEqual(egresoEn);

      const eventos = internacion.extraerEventos();
      expect(eventos).toHaveLength(1);
      expect(eventos[0]).toBeInstanceOf(PacienteDadoDeAlta);
      const ev = eventos[0] as PacienteDadoDeAlta;
      expect(ev.internacionId).toBe(internacionId);
      expect(ev.pacienteId).toBe(pacienteId);
      expect(ev.ingresoEn).toEqual(ingresoEn);
      expect(ev.egresoEn).toEqual(egresoEn);
    });

    it('debería lanzar InternacionYaFinalizada si ya fue dada de alta', () => {
      const internacion = Internacion.crear({
        id: internacionId,
        pacienteId,
        camaId,
        medicoId,
        motivo: 'Observación',
        ingresoEn,
      });
      internacion.darDeAlta(new Date('2026-10-22T10:00:00Z'));

      expect(() => internacion.darDeAlta(new Date('2026-10-23T10:00:00Z'))).toThrow(
        InternacionYaFinalizada,
      );
    });
  });
});
