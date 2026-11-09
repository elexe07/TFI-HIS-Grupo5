import { CantidadInvalida, Insumo, InsumoNoEncontrado } from '../../domain';
import { InsumoRepositoryEnMemoria } from '../../testing';
import { RegistrarIngresoInsumoCommand } from './registrar-ingreso-insumo.command';
import { RegistrarIngresoInsumoHandler } from './registrar-ingreso-insumo.handler';

describe('RegistrarIngresoInsumoHandler (REC-05)', () => {
  let insumos: InsumoRepositoryEnMemoria;
  let handler: RegistrarIngresoInsumoHandler;

  const insumoId = '11111111-1111-1111-1111-111111111111';

  beforeEach(async () => {
    insumos = new InsumoRepositoryEnMemoria();
    handler = new RegistrarIngresoInsumoHandler(insumos);

    await insumos.guardar(
      Insumo.reconstituir({
        id: insumoId,
        codigo: 'INS-001',
        nombre: 'Amoxicilina 500mg',
        stockActual: 10,
        stockMinimo: 5,
      }),
    );
  });

  it('suma la cantidad ingresada al stock actual y devuelve el DTO actualizado', async () => {
    const dto = await handler.ejecutar(
      new RegistrarIngresoInsumoCommand({ insumoId, cantidad: 15 }),
    );

    expect(dto.stockActual).toBe(25);
    const guardado = await insumos.buscarPorId(insumoId);
    expect(guardado?.stockActual).toBe(25);
  });

  it('falla con InsumoNoEncontrado si el insumo no existe', async () => {
    await expect(
      handler.ejecutar(
        new RegistrarIngresoInsumoCommand({
          insumoId: '99999999-9999-9999-9999-999999999999',
          cantidad: 10,
        }),
      ),
    ).rejects.toThrow(InsumoNoEncontrado);
  });

  it('falla con CantidadInvalida si la cantidad es menor o igual a cero', async () => {
    await expect(
      handler.ejecutar(
        new RegistrarIngresoInsumoCommand({ insumoId, cantidad: 0 }),
      ),
    ).rejects.toThrow(CantidadInvalida);
  });
});
