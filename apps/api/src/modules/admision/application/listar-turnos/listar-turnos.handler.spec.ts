import { Documento } from '../../domain/documento';
import { Paciente } from '../../domain/paciente';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { Turno } from '../../domain/turno';
import { PacienteRepositoryEnMemoria, TurnoRepositoryEnMemoria } from '../../testing';
import { ListarTurnosHandler } from './listar-turnos.handler';
import { ListarTurnosQuery } from './listar-turnos.query';

describe('ListarTurnosHandler', () => {
  const ahora = new Date('2026-10-23T10:00:00Z');
  let turnos: TurnoRepositoryEnMemoria;
  let pacientes: PacienteRepositoryEnMemoria;
  let handler: ListarTurnosHandler;

  const turno = (pacienteId: string, medicoId: string, hora: number): Turno =>
    Turno.crear(
      {
        pacienteId,
        medicoId,
        inicio: new Date(`2026-10-26T0${hora}:00:00Z`),
        fin: new Date(`2026-10-26T0${hora}:30:00Z`),
        creadoPor: 'recep-1',
      },
      ahora,
    );

  beforeEach(async () => {
    turnos = new TurnoRepositoryEnMemoria();
    pacientes = new PacienteRepositoryEnMemoria();
    handler = new ListarTurnosHandler(turnos, pacientes);
    await turnos.guardar(turno('p1', 'm1', 8));
    await turnos.guardar(turno('p2', 'm2', 9));
  });

  it('debería listar turnos filtrados por médico o paciente', async () => {
    const porMedico = await handler.ejecutar(new ListarTurnosQuery({ medicoId: 'm1' }));
    expect(porMedico).toHaveLength(1);
    expect(porMedico[0]?.pacienteId).toBe('p1');

    const todos = await handler.ejecutar(new ListarTurnosQuery());
    expect(todos).toHaveLength(2);
  });

  describe('cuando pide un paciente', () => {
    const solicitante = { usuarioId: 'usuario-paciente', esPaciente: true };

    it('solo ve sus turnos, aunque pida los de otro paciente', async () => {
      const propio = Paciente.crear(
        {
          usuarioId: solicitante.usuarioId,
          documento: Documento.crear(TipoDocumento.DNI, '30111222'),
          nombre: 'Juan',
          apellido: 'Pérez',
          fechaNacimiento: new Date('1990-05-15'),
          sexo: Sexo.M,
        },
        ahora,
      );
      await pacientes.guardar(propio);
      await turnos.guardar(turno(propio.id, 'm1', 7));

      const lista = await handler.ejecutar(
        new ListarTurnosQuery({ pacienteId: 'p2' }, solicitante),
      );

      expect(lista).toHaveLength(1);
      expect(lista[0]?.pacienteId).toBe(propio.id);
    });

    it('sin ficha vinculada no ve ningún turno', async () => {
      const lista = await handler.ejecutar(new ListarTurnosQuery({}, solicitante));

      expect(lista).toEqual([]);
    });
  });
});
