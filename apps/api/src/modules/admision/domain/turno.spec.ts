import { DatosDeTurnoInvalidos, Turno } from './turno';
import { EstadoTurno } from './tipos';
import { TurnoNoCancelable } from './errores';

describe('Turno', () => {
  const ahora = new Date('2026-10-23T10:00:00Z');
  const inicio = new Date('2026-10-26T09:00:00Z');
  const fin = new Date('2026-10-26T09:30:00Z');

  it('debería crearse en estado RESERVADO', () => {
    const turno = Turno.crear(
      {
        pacienteId: 'pac-1',
        medicoId: 'med-1',
        inicio,
        fin,
        motivoConsulta: 'Control de rutina',
        creadoPor: 'usr-recep',
      },
      ahora,
    );

    expect(turno.id).toBeDefined();
    expect(turno.estado).toBe(EstadoTurno.RESERVADO);
    expect(turno.estaReservado).toBe(true);
    expect(turno.motivoConsulta).toBe('Control de rutina');
    expect(turno.creadoPor).toBe('usr-recep');
  });

  it('debería fallar si fin <= inicio', () => {
    expect(() =>
      Turno.crear(
        {
          pacienteId: 'pac-1',
          medicoId: 'med-1',
          inicio,
          fin: inicio,
          creadoPor: 'usr-recep',
        },
        ahora,
      ),
    ).toThrow(DatosDeTurnoInvalidos);
  });

  it('debería cancelarse correctamente si está RESERVADO', () => {
    const turno = Turno.crear(
      {
        pacienteId: 'pac-1',
        medicoId: 'med-1',
        inicio,
        fin,
        creadoPor: 'usr-recep',
      },
      ahora,
    );

    const despues = new Date('2026-10-23T12:00:00Z');
    turno.cancelar(despues);

    expect(turno.estado).toBe(EstadoTurno.CANCELADO);
    expect(turno.estaReservado).toBe(false);
    expect(turno.updatedAt).toEqual(despues);
  });

  it('debería fallar al intentar cancelar un turno que no está RESERVADO', () => {
    const turno = Turno.crear(
      {
        pacienteId: 'pac-1',
        medicoId: 'med-1',
        inicio,
        fin,
        creadoPor: 'usr-recep',
      },
      ahora,
    );

    turno.cancelar(ahora);

    // Segundo intento de cancelación debe fallar
    expect(() => turno.cancelar(ahora)).toThrow(TurnoNoCancelable);
  });

  it('debería pasar a ATENDIDO correctamente y no permitir cancelación posterior', () => {
    const turno = Turno.crear(
      {
        pacienteId: 'pac-1',
        medicoId: 'med-1',
        inicio,
        fin,
        creadoPor: 'usr-recep',
      },
      ahora,
    );

    turno.atender(ahora);
    expect(turno.estado).toBe(EstadoTurno.ATENDIDO);
    expect(() => turno.cancelar(ahora)).toThrow(TurnoNoCancelable);
  });

  it('debería detectar superposición de horarios', () => {
    const turno = Turno.crear(
      {
        pacienteId: 'pac-1',
        medicoId: 'med-1',
        inicio,
        fin,
        creadoPor: 'usr-recep',
      },
      ahora,
    );

    // Superposición parcial dentro
    expect(
      turno.seSuperponeCon(new Date('2026-10-26T09:15:00Z'), new Date('2026-10-26T09:45:00Z')),
    ).toBe(true);

    // Turno contiguo después (no se superpone)
    expect(
      turno.seSuperponeCon(new Date('2026-10-26T09:30:00Z'), new Date('2026-10-26T10:00:00Z')),
    ).toBe(false);

    // Turno contiguo antes (no se superpone)
    expect(
      turno.seSuperponeCon(new Date('2026-10-26T08:30:00Z'), new Date('2026-10-26T09:00:00Z')),
    ).toBe(false);
  });
});

