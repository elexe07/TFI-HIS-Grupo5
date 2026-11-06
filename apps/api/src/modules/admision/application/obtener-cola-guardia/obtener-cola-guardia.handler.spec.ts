import { NivelTriaje } from '../../domain/tipos';
import { Triaje } from '../../domain/triaje';
import { TriajeRepositoryEnMemoria } from '../../testing/triaje.repository.en-memoria';
import { ObtenerColaGuardiaHandler } from './obtener-cola-guardia.handler';

describe('ObtenerColaGuardiaHandler (ADM-07)', () => {
  it('debería devolver la cola ordenada por severidad (nivel) y luego por llegada', async () => {
    const repo = new TriajeRepositoryEnMemoria();
    const handler = new ObtenerColaGuardiaHandler(repo);

    const t1Verde = Triaje.crear(
      { pacienteId: 'p1', nivel: NivelTriaje.VERDE, motivo: 'Fiebre leve', registradoPor: 'enf-1' },
      new Date('2026-10-23T08:00:00Z'),
    );
    const t2Rojo = Triaje.crear(
      {
        pacienteId: 'p2',
        nivel: NivelTriaje.ROJO,
        motivo: 'Traumatismo craneal severo',
        registradoPor: 'enf-1',
      },
      new Date('2026-10-23T08:30:00Z'),
    );
    const t3AmarilloPrimero = Triaje.crear(
      {
        pacienteId: 'p3',
        nivel: NivelTriaje.AMARILLO,
        motivo: 'Dolor torácico moderado',
        registradoPor: 'enf-1',
      },
      new Date('2026-10-23T08:10:00Z'),
    );
    const t4AmarilloSegundo = Triaje.crear(
      {
        pacienteId: 'p4',
        nivel: NivelTriaje.AMARILLO,
        motivo: 'Crisis asmática leve',
        registradoPor: 'enf-1',
      },
      new Date('2026-10-23T08:20:00Z'),
    );

    await repo.guardar(t1Verde);
    await repo.guardar(t2Rojo);
    await repo.guardar(t3AmarilloPrimero);
    await repo.guardar(t4AmarilloSegundo);

    const cola = await handler.ejecutar();

    expect(cola).toHaveLength(4);
    // 1. ROJO (prioridad 1)
    expect(cola[0]?.id).toBe(t2Rojo.id);
    expect(cola[0]?.nivel).toBe(NivelTriaje.ROJO);
    // 2. AMARILLO (08:10 antes que 08:20)
    expect(cola[1]?.id).toBe(t3AmarilloPrimero.id);
    // 3. AMARILLO (08:20)
    expect(cola[2]?.id).toBe(t4AmarilloSegundo.id);
    // 4. VERDE
    expect(cola[3]?.id).toBe(t1Verde.id);
  });
});
