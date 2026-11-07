import { RelojFijo } from '../../../../building-blocks/testing';
import { Documento } from '../../domain/documento';
import {
  TurnoNoCancelable,
  TurnoNoEncontrado,
  TurnoNoPerteneceAlPaciente,
} from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { EstadoTurno, Sexo, TipoDocumento } from '../../domain/tipos';
import { Turno } from '../../domain/turno';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { TurnoRepositoryEnMemoria } from '../../testing/turno.repository.en-memoria';
import { CancelarTurnoCommand } from './cancelar-turno.command';
import { CancelarTurnoHandler } from './cancelar-turno.handler';

describe('CancelarTurnoHandler (ADM-05)', () => {
  let turnoRepo: TurnoRepositoryEnMemoria;
  let pacienteRepo: PacienteRepositoryEnMemoria;
  let handler: CancelarTurnoHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');
  let pacienteId: string;
  let usuarioIdPaciente: string;

  beforeEach(async () => {
    turnoRepo = new TurnoRepositoryEnMemoria();
    pacienteRepo = new PacienteRepositoryEnMemoria();
    handler = new CancelarTurnoHandler(turnoRepo, pacienteRepo, new RelojFijo(ahora));

    usuarioIdPaciente = 'usr-pac-1';
    const paciente = Paciente.crear(
      {
        usuarioId: usuarioIdPaciente,
        documento: Documento.crear(TipoDocumento.DNI, '20999888'),
        nombre: 'Sofía',
        apellido: 'Castro',
        fechaNacimiento: new Date('1990-01-01'),
        sexo: Sexo.F,
      },
      ahora,
    );
    await pacienteRepo.guardar(paciente);
    pacienteId = paciente.id;
  });

  it('debería cancelar un turno en estado RESERVADO', async () => {
    const turno = Turno.crear(
      {
        pacienteId,
        medicoId: 'med-1',
        inicio: new Date('2026-10-26T09:00:00Z'),
        fin: new Date('2026-10-26T09:30:00Z'),
        creadoPor: 'recep-1',
      },
      ahora,
    );
    await turnoRepo.guardar(turno);

    const res = await handler.ejecutar(
      new CancelarTurnoCommand({
        turnoId: turno.id,
        usuarioId: 'recep-1',
        esPaciente: false,
      }),
    );

    expect(res.estado).toBe(EstadoTurno.CANCELADO);

    const enBase = await turnoRepo.buscarPorId(turno.id);
    expect(enBase?.estado).toBe(EstadoTurno.CANCELADO);
  });

  it('debería fallar al intentar cancelar un turno ya cancelado', async () => {
    const turno = Turno.crear(
      {
        pacienteId,
        medicoId: 'med-1',
        inicio: new Date('2026-10-26T09:00:00Z'),
        fin: new Date('2026-10-26T09:30:00Z'),
        creadoPor: 'recep-1',
      },
      ahora,
    );
    turno.cancelar(ahora);
    await turnoRepo.guardar(turno);

    await expect(
      handler.ejecutar(
        new CancelarTurnoCommand({
          turnoId: turno.id,
          usuarioId: 'recep-1',
          esPaciente: false,
        }),
      ),
    ).rejects.toThrow(TurnoNoCancelable);
  });

  it('debería fallar si un paciente intenta cancelar el turno de otro paciente', async () => {
    const turnoDeOtro = Turno.crear(
      {
        pacienteId: 'otro-paciente-id',
        medicoId: 'med-1',
        inicio: new Date('2026-10-26T09:00:00Z'),
        fin: new Date('2026-10-26T09:30:00Z'),
        creadoPor: 'recep-1',
      },
      ahora,
    );
    await turnoRepo.guardar(turnoDeOtro);

    await expect(
      handler.ejecutar(
        new CancelarTurnoCommand({
          turnoId: turnoDeOtro.id,
          usuarioId: usuarioIdPaciente,
          esPaciente: true,
        }),
      ),
    ).rejects.toThrow(TurnoNoPerteneceAlPaciente);
  });

  it('debería fallar si el turno no existe', async () => {
    await expect(
      handler.ejecutar(
        new CancelarTurnoCommand({
          turnoId: 'inexistente',
          usuarioId: 'recep-1',
          esPaciente: false,
        }),
      ),
    ).rejects.toThrow(TurnoNoEncontrado);
  });
});
