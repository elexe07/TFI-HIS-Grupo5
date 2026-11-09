import { Cama, EstadoCama, Habitacion, Internacion } from '../../domain';
import {
  CamaRepositoryEnMemoria,
  HabitacionRepositoryEnMemoria,
  InternacionRepositoryEnMemoria,
} from '../../testing';
import { ObtenerMapaCamasHandler } from './obtener-mapa-camas.handler';
import { ObtenerMapaCamasQuery } from './obtener-mapa-camas.query';

describe('ObtenerMapaCamasHandler (REC-04)', () => {
  let habitaciones: HabitacionRepositoryEnMemoria;
  let camas: CamaRepositoryEnMemoria;
  let internaciones: InternacionRepositoryEnMemoria;
  let handler: ObtenerMapaCamasHandler;

  beforeEach(async () => {
    habitaciones = new HabitacionRepositoryEnMemoria();
    camas = new CamaRepositoryEnMemoria();
    internaciones = new InternacionRepositoryEnMemoria();
    handler = new ObtenerMapaCamasHandler(habitaciones, camas, internaciones);

    // Setup: 2 habitaciones
    const h1 = Habitacion.reconstituir({
      id: 'hab-1',
      sector: 'Guardia',
      numero: '1',
    });
    const h2 = Habitacion.reconstituir({
      id: 'hab-2',
      sector: 'Clínica Médica',
      numero: '101',
    });
    await habitaciones.guardar(h1);
    await habitaciones.guardar(h2);

    // Setup: 4 camas en total
    // hab-1: 1 LIBRE, 1 OCUPADA
    await camas.guardar(
      Cama.reconstituir({
        id: 'cama-1',
        habitacionId: 'hab-1',
        codigo: 'G-1A',
        estado: EstadoCama.LIBRE,
      }),
    );
    await camas.guardar(
      Cama.reconstituir({
        id: 'cama-2',
        habitacionId: 'hab-1',
        codigo: 'G-1B',
        estado: EstadoCama.OCUPADA,
      }),
    );
    // hab-2: 1 EN_LIMPIEZA, 1 BLOQUEADA
    await camas.guardar(
      Cama.reconstituir({
        id: 'cama-3',
        habitacionId: 'hab-2',
        codigo: 'CM-101A',
        estado: EstadoCama.EN_LIMPIEZA,
      }),
    );
    await camas.guardar(
      Cama.reconstituir({
        id: 'cama-4',
        habitacionId: 'hab-2',
        codigo: 'CM-101B',
        estado: EstadoCama.BLOQUEADA,
      }),
    );

    // Internación activa para cama-2
    await internaciones.guardar(
      Internacion.crear({
        id: 'int-1',
        pacienteId: 'pac-1',
        camaId: 'cama-2',
        medicoId: 'med-1',
        motivo: 'Observación',
        ingresoEn: new Date('2026-10-23T08:00:00Z'),
      }),
    );
  });

  it('calcula los conteos exactos por estado y total', async () => {
    const mapa = await handler.ejecutar(new ObtenerMapaCamasQuery());

    expect(mapa.totales).toEqual({
      libre: 1,
      ocupada: 1,
      enLimpieza: 1,
      bloqueada: 1,
      total: 4,
    });
  });

  it('agrupa las camas por habitación e incluye datos de internación activa si está ocupada', async () => {
    const mapa = await handler.ejecutar(new ObtenerMapaCamasQuery());

    expect(mapa.habitaciones).toHaveLength(2);

    const habGuardia = mapa.habitaciones.find((h) => h.sector === 'Guardia')!;
    expect(habGuardia.camas).toHaveLength(2);

    const camaOcupada = habGuardia.camas.find((c) => c.codigo === 'G-1B')!;
    expect(camaOcupada.estado).toBe(EstadoCama.OCUPADA);
    expect(camaOcupada.internacionActiva).toBeDefined();
    expect(camaOcupada.internacionActiva!.pacienteId).toBe('pac-1');

    const camaLibre = habGuardia.camas.find((c) => c.codigo === 'G-1A')!;
    expect(camaLibre.estado).toBe(EstadoCama.LIBRE);
    expect(camaLibre.internacionActiva).toBeNull();
  });
});
