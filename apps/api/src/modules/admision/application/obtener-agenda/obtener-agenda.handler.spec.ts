import { AgendaMedico } from '../../domain/agenda';
import { Medico } from '../../domain/medico';
import { AgendaRepositoryEnMemoria } from '../../testing/agenda.repository.en-memoria';
import { MedicoRepositoryEnMemoria } from '../../testing/medico.repository.en-memoria';
import { ObtenerAgendaHandler } from './obtener-agenda.handler';
import { ObtenerAgendaQuery } from './obtener-agenda.query';

describe('ObtenerAgendaHandler', () => {
  it('debería devolver la agenda del médico', async () => {
    const agendaRepo = new AgendaRepositoryEnMemoria();
    const medicoRepo = new MedicoRepositoryEnMemoria();
    const handler = new ObtenerAgendaHandler(agendaRepo, medicoRepo);
    const ahora = new Date('2026-10-23T10:00:00Z');

    const medico = Medico.crear(
      {
        usuarioId: 'u1',
        matricula: 'M1',
        nombre: 'Juan',
        apellido: 'Pérez',
        especialidad: 'Pediatría',
      },
      ahora,
    );
    await medicoRepo.guardar(medico);

    await agendaRepo.guardar(
      AgendaMedico.crear(medico.id, [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
      ]),
    );

    const res = await handler.ejecutar(new ObtenerAgendaQuery(medico.id));
    expect(res.medicoId).toBe(medico.id);
    expect(res.franjas).toHaveLength(1);
    expect(res.franjas[0]?.horaInicio).toBe('08:00');
  });
});

