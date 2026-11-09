import { Insumo } from '../../domain';
import { InsumoRepositoryEnMemoria } from '../../testing';
import { ListarInsumosHandler } from './listar-insumos.handler';
import { ListarInsumosQuery } from './listar-insumos.query';

describe('ListarInsumosHandler (REC-07)', () => {
  let insumos: InsumoRepositoryEnMemoria;
  let handler: ListarInsumosHandler;

  beforeEach(async () => {
    insumos = new InsumoRepositoryEnMemoria();
    handler = new ListarInsumosHandler(insumos);

    // Insumo 1: bajo mínimo (3 <= 5)
    await insumos.guardar(
      Insumo.reconstituir({
        id: '11111111-1111-1111-1111-111111111111',
        codigo: 'INS-001',
        nombre: 'Gasas estériles',
        stockActual: 3,
        stockMinimo: 5,
      }),
    );

    // Insumo 2: stock normal (20 > 10)
    await insumos.guardar(
      Insumo.reconstituir({
        id: '22222222-2222-2222-2222-222222222222',
        codigo: 'INS-002',
        nombre: 'Guantes de látex M',
        stockActual: 20,
        stockMinimo: 10,
      }),
    );
  });

  it('devuelve todos los insumos cuando no se especifica filtro', async () => {
    const lista = await handler.ejecutar(new ListarInsumosQuery());
    expect(lista).toHaveLength(2);
  });

  it('devuelve únicamente los insumos bajo mínimo cuando bajoMinimo es true (REC-07)', async () => {
    const lista = await handler.ejecutar(new ListarInsumosQuery({ bajoMinimo: true }));
    expect(lista).toHaveLength(1);
    expect(lista[0]!.codigo).toBe('INS-001');
    expect(lista[0]!.bajoMinimo).toBe(true);
  });
});
