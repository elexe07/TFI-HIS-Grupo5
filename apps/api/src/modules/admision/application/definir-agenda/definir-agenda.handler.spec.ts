import { FranjasSolapadas, MedicoNoEncontrado } from '../../domain/errores';
import { Medico } from '../../domain/medico';
import { AgendaRepositoryEnMemoria } from '../../testing/agenda.repository.en-memoria';
import { MedicoRepositoryEnMemoria } from '../../testing/medico.repository.en-memoria';
import { DefinirAgendaCommand } from './definir-agenda.command';
import { DefinirAgendaHandler } from './definir-agenda.handler';

describe('DefinirAgendaHandler (ADM-03)', () => {
  let agendaRepo: AgendaRepositoryEnMemoria;
  let medicoRepo: MedicoRepositoryEnMemoria;
  let handler: DefinirAgendaHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');
  let medicoId: string;

  beforeEach(async () => {
    agendaRepo = new AgendaRepositoryEnMemoria();
    medicoRepo = new MedicoRepositoryEnMemoria();
    handler = new DefinirAgendaHandler(agendaRepo, medicoRepo);

    const medico = Medico.crear(
      {
        usuarioId: 'u-1',
        matricula: 'MN-111',
        nombre: 'Roberto',
        apellido: 'Gómez',
        especialidad: 'Clínica Médica',
      },
      ahora,
    );
    await medicoRepo.guardar(medico);
    medicoId = medico.id;
  });

  it('debería definir la agenda correctamente cuando las franjas no se solapan', async () => {
    const res = await handler.ejecutar(
      new DefinirAgendaCommand({
        medicoId,
        franjas: [
          { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
          { diaSemana: 1, horaInicio: '14:00', horaFin: '18:00', duracionTurnoMin: 30 },
        ],
      }),
    );

    expect(res.medicoId).toBe(medicoId);
    expect(res.franjas).toHaveLength(2);

    const guardada = await agendaRepo.buscarPorMedicoId(medicoId);
    expect(guardada).not.toBeNull();
    expect(guardada?.obtenerFranjas()).toHaveLength(2);
  });

  it('debería fallar si franjas del mismo día se solapan', async () => {
    await expect(
      handler.ejecutar(
        new DefinirAgendaCommand({
          medicoId,
          franjas: [
            { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
            { diaSemana: 1, horaInicio: '10:00', horaFin: '14:00', duracionTurnoMin: 30 },
          ],
        }),
      ),
    ).rejects.toThrow(FranjasSolapadas);
  });

  it('debería fallar si el médico no existe', async () => {
    await expect(
      handler.ejecutar(
        new DefinirAgendaCommand({
          medicoId: 'inexistente',
          franjas: [{ diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 }],
        }),
      ),
    ).rejects.toThrow(MedicoNoEncontrado);
  });
});
