import { AgendaMedico } from './agenda';
import { FranjaHorariaInvalida, FranjasSolapadas } from './errores';

describe('AgendaMedico', () => {
  const medicoId = 'med-1';

  it('debería crearse correctamente con franjas no solapadas', () => {
    const agenda = AgendaMedico.crear(medicoId, [
      { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
      { diaSemana: 1, horaInicio: '14:00', horaFin: '18:00', duracionTurnoMin: 30 },
      { diaSemana: 2, horaInicio: '09:00', horaFin: '13:00', duracionTurnoMin: 20 },
    ]);

    expect(agenda.medicoId).toBe(medicoId);
    expect(agenda.obtenerFranjas()).toHaveLength(3);
  });

  it('debería fallar si dos franjas del mismo día se solapan', () => {
    expect(() =>
      AgendaMedico.crear(medicoId, [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
        { diaSemana: 1, horaInicio: '11:00', horaFin: '14:00', duracionTurnoMin: 30 },
      ]),
    ).toThrow(FranjasSolapadas);
  });

  it('no debería fallar si dos franjas tienen los mismos horarios pero en días diferentes', () => {
    const agenda = AgendaMedico.crear(medicoId, [
      { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
      { diaSemana: 2, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
    ]);
    expect(agenda.obtenerFranjas()).toHaveLength(2);
  });

  it('debería fallar si horaFin <= horaInicio', () => {
    expect(() =>
      AgendaMedico.crear(medicoId, [
        { diaSemana: 1, horaInicio: '14:00', horaFin: '14:00', duracionTurnoMin: 30 },
      ]),
    ).toThrow(FranjaHorariaInvalida);

    expect(() =>
      AgendaMedico.crear(medicoId, [
        { diaSemana: 1, horaInicio: '15:00', horaFin: '14:00', duracionTurnoMin: 30 },
      ]),
    ).toThrow(FranjaHorariaInvalida);
  });

  it('debería validar si un turno cae dentro del horario de la agenda', () => {
    const agenda = AgendaMedico.crear(medicoId, [
      { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 }, // Lunes
    ]);

    // 2026-10-26 es Lunes (UTC day 1)
    const turnoValidoInicio = new Date('2026-10-26T08:30:00Z');
    const turnoValidoFin = new Date('2026-10-26T09:00:00Z');
    expect(agenda.permiteTurno(turnoValidoInicio, turnoValidoFin, true)).toBe(true);

    // Fuera de hora (tarde)
    const turnoTardeInicio = new Date('2026-10-26T12:00:00Z');
    const turnoTardeFin = new Date('2026-10-26T12:30:00Z');
    expect(agenda.permiteTurno(turnoTardeInicio, turnoTardeFin, true)).toBe(false);

    // Día incorrecto: 2026-10-27 es Martes (UTC day 2)
    const turnoMartesInicio = new Date('2026-10-27T08:30:00Z');
    const turnoMartesFin = new Date('2026-10-27T09:00:00Z');
    expect(agenda.permiteTurno(turnoMartesInicio, turnoMartesFin, true)).toBe(false);
  });
});

