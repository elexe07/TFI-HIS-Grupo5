import { RelojFijo } from '../../../../building-blocks/testing';
import { AgendaMedico } from '../../domain/agenda';
import { Documento } from '../../domain/documento';
import { FranjaOcupada, TurnoFueraDeAgenda } from '../../domain/errores';
import { Medico } from '../../domain/medico';
import { Paciente } from '../../domain/paciente';
import { EstadoTurno, Sexo, TipoDocumento } from '../../domain/tipos';
import { AgendaRepositoryEnMemoria } from '../../testing/agenda.repository.en-memoria';
import { MedicoRepositoryEnMemoria } from '../../testing/medico.repository.en-memoria';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { TurnoRepositoryEnMemoria } from '../../testing/turno.repository.en-memoria';
import { ReservarTurnoCommand } from './reservar-turno.command';
import { ReservarTurnoHandler } from './reservar-turno.handler';

describe('ReservarTurnoHandler (ADM-04)', () => {
  let turnoRepo: TurnoRepositoryEnMemoria;
  let agendaRepo: AgendaRepositoryEnMemoria;
  let medicoRepo: MedicoRepositoryEnMemoria;
  let pacienteRepo: PacienteRepositoryEnMemoria;
  let handler: ReservarTurnoHandler;

  const ahora = new Date('2026-10-23T10:00:00Z');
  let pacienteId: string;
  let medicoId: string;

  beforeEach(async () => {
    turnoRepo = new TurnoRepositoryEnMemoria();
    agendaRepo = new AgendaRepositoryEnMemoria();
    medicoRepo = new MedicoRepositoryEnMemoria();
    pacienteRepo = new PacienteRepositoryEnMemoria();
    handler = new ReservarTurnoHandler(
      turnoRepo,
      agendaRepo,
      medicoRepo,
      pacienteRepo,
      new RelojFijo(ahora),
    );

    const paciente = Paciente.crear(
      {
        documento: Documento.crear(TipoDocumento.DNI, '12345678'),
        nombre: 'Pedro',
        apellido: 'Pascal',
        fechaNacimiento: new Date('1985-04-02'),
        sexo: Sexo.M,
      },
      ahora,
    );
    await pacienteRepo.guardar(paciente);
    pacienteId = paciente.id;

    const medico = Medico.crear(
      {
        usuarioId: 'usr-med-1',
        matricula: 'MN-5544',
        nombre: 'Elena',
        apellido: 'Ríos',
        especialidad: 'Dermatología',
      },
      ahora,
    );
    await medicoRepo.guardar(medico);
    medicoId = medico.id;

    // 2026-10-26 es Lunes (UTC day 1)
    await agendaRepo.guardar(
      AgendaMedico.crear(medicoId, [
        { diaSemana: 1, horaInicio: '08:00', horaFin: '12:00', duracionTurnoMin: 30 },
      ]),
    );
  });

  it('debería reservar un turno correctamente dentro de la agenda', async () => {
    const res = await handler.ejecutar(
      new ReservarTurnoCommand({
        pacienteId,
        medicoId,
        inicio: '2026-10-26T09:00:00Z',
        motivoConsulta: 'Revisión de lunares',
        creadoPor: 'usr-recep',
      }),
    );

    expect(res.id).toBeDefined();
    expect(res.pacienteId).toBe(pacienteId);
    expect(res.medicoId).toBe(medicoId);
    expect(res.estado).toBe(EstadoTurno.RESERVADO);
    expect(res.inicio).toBe('2026-10-26T09:00:00.000Z');
    expect(res.fin).toBe('2026-10-26T09:30:00.000Z');

    const enBase = await turnoRepo.buscarPorId(res.id);
    expect(enBase).not.toBeNull();
    expect(enBase?.estaReservado).toBe(true);
  });

  it('debería fallar si el horario está fuera de la agenda del médico', async () => {
    // Horario después de fin de agenda (12:00)
    await expect(
      handler.ejecutar(
        new ReservarTurnoCommand({
          pacienteId,
          medicoId,
          inicio: '2026-10-26T14:00:00Z',
          creadoPor: 'usr-recep',
        }),
      ),
    ).rejects.toThrow(TurnoFueraDeAgenda);

    // Día que el médico no atiende (2026-10-27 es Martes)
    await expect(
      handler.ejecutar(
        new ReservarTurnoCommand({
          pacienteId,
          medicoId,
          inicio: '2026-10-27T09:00:00Z',
          creadoPor: 'usr-recep',
        }),
      ),
    ).rejects.toThrow(TurnoFueraDeAgenda);
  });

  it('debería fallar si la franja ya está ocupada por otro turno', async () => {
    await handler.ejecutar(
      new ReservarTurnoCommand({
        pacienteId,
        medicoId,
        inicio: '2026-10-26T09:00:00Z',
        creadoPor: 'usr-recep',
      }),
    );

    // Mismo horario
    await expect(
      handler.ejecutar(
        new ReservarTurnoCommand({
          pacienteId,
          medicoId,
          inicio: '2026-10-26T09:00:00Z',
          creadoPor: 'usr-recep',
        }),
      ),
    ).rejects.toThrow(FranjaOcupada);

    // Superposición parcial (09:15)
    await expect(
      handler.ejecutar(
        new ReservarTurnoCommand({
          pacienteId,
          medicoId,
          inicio: '2026-10-26T09:15:00Z',
          creadoPor: 'usr-recep',
        }),
      ),
    ).rejects.toThrow(FranjaOcupada);
  });
});
