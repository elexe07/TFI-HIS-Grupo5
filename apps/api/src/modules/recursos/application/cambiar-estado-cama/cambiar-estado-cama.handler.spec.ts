import { Cama, CamaNoEncontrada, EstadoCama, TransicionDeCamaInvalida } from '../../domain';
import { CamaRepositoryEnMemoria } from '../../testing';
import { CambiarEstadoCamaCommand } from './cambiar-estado-cama.command';
import { CambiarEstadoCamaHandler } from './cambiar-estado-cama.handler';

describe('CambiarEstadoCamaHandler (REC-03)', () => {
  let camas: CamaRepositoryEnMemoria;
  let handler: CambiarEstadoCamaHandler;

  const camaId = '11111111-1111-1111-1111-111111111111';
  const habitacionId = '22222222-2222-2222-2222-222222222222';

  beforeEach(() => {
    camas = new CamaRepositoryEnMemoria();
    handler = new CambiarEstadoCamaHandler(camas);
  });

  it('permite limpiar una cama en estado EN_LIMPIEZA pasando a LIBRE', async () => {
    await camas.guardar(
      Cama.reconstituir({
        id: camaId,
        habitacionId,
        codigo: 'G-1A',
        estado: EstadoCama.EN_LIMPIEZA,
      }),
    );

    const dto = await handler.ejecutar(
      new CambiarEstadoCamaCommand({ camaId, nuevoEstado: EstadoCama.LIBRE }),
    );

    expect(dto.estado).toBe(EstadoCama.LIBRE);
    const guardada = await camas.buscarPorId(camaId);
    expect(guardada?.estado).toBe(EstadoCama.LIBRE);
  });

  it('permite bloquear una cama en estado LIBRE pasando a BLOQUEADA', async () => {
    await camas.guardar(
      Cama.reconstituir({
        id: camaId,
        habitacionId,
        codigo: 'G-1A',
        estado: EstadoCama.LIBRE,
      }),
    );

    const dto = await handler.ejecutar(
      new CambiarEstadoCamaCommand({ camaId, nuevoEstado: EstadoCama.BLOQUEADA }),
    );

    expect(dto.estado).toBe(EstadoCama.BLOQUEADA);
    const guardada = await camas.buscarPorId(camaId);
    expect(guardada?.estado).toBe(EstadoCama.BLOQUEADA);
  });

  it('falla con TransicionDeCamaInvalida si la transición es ilegal', async () => {
    await camas.guardar(
      Cama.reconstituir({
        id: camaId,
        habitacionId,
        codigo: 'G-1A',
        estado: EstadoCama.OCUPADA,
      }),
    );

    await expect(
      handler.ejecutar(new CambiarEstadoCamaCommand({ camaId, nuevoEstado: EstadoCama.LIBRE })),
    ).rejects.toThrow(TransicionDeCamaInvalida);
  });

  it('falla con CamaNoEncontrada si la cama no existe', async () => {
    await expect(
      handler.ejecutar(
        new CambiarEstadoCamaCommand({
          camaId: '99999999-9999-9999-9999-999999999999',
          nuevoEstado: EstadoCama.LIBRE,
        }),
      ),
    ).rejects.toThrow(CamaNoEncontrada);
  });
});
