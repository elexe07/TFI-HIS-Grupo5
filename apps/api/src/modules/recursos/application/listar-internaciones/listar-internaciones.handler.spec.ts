import { EstadoInternacion, Internacion } from '../../domain';
import { InternacionRepositoryEnMemoria } from '../../testing';
import { ListarInternacionesHandler } from './listar-internaciones.handler';
import { ListarInternacionesQuery } from './listar-internaciones.query';

describe('ListarInternacionesHandler', () => {
  let internaciones: InternacionRepositoryEnMemoria;
  let handler: ListarInternacionesHandler;

  const internacion = (id: string, estado: EstadoInternacion): Internacion =>
    Internacion.reconstituir({
      id,
      pacienteId: `paciente-${id}`,
      camaId: `cama-${id}`,
      medicoId: 'medico-1',
      motivo: 'Observación',
      estado,
      ingresoEn: new Date('2026-10-20T10:00:00Z'),
      egresoEn: estado === EstadoInternacion.ALTA ? new Date('2026-10-22T10:00:00Z') : null,
    });

  beforeEach(async () => {
    internaciones = new InternacionRepositoryEnMemoria();
    handler = new ListarInternacionesHandler(internaciones);
    await internaciones.guardar(internacion('1', EstadoInternacion.ACTIVA));
    await internaciones.guardar(internacion('2', EstadoInternacion.ALTA));
  });

  it('sin filtro devuelve todas las internaciones', async () => {
    const lista = await handler.ejecutar(new ListarInternacionesQuery());

    expect(lista).toHaveLength(2);
  });

  it('filtra por estado', async () => {
    const lista = await handler.ejecutar(new ListarInternacionesQuery(EstadoInternacion.ACTIVA));

    expect(lista).toHaveLength(1);
    expect(lista[0]?.estado).toBe(EstadoInternacion.ACTIVA);
  });
});
