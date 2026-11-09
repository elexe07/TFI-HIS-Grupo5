import { Insumo, StockInsuficiente } from '../../domain';
import {
  EventosProcesadosRepositoryEnMemoria,
  InsumoRepositoryEnMemoria,
} from '../../testing';
import { DescontarInsumoPorEventoCommand } from './descontar-insumo-evento.command';
import { DescontarInsumoPorEventoHandler } from './descontar-insumo-evento.handler';

describe('DescontarInsumoPorEventoHandler (REC-06)', () => {
  let insumos: InsumoRepositoryEnMemoria;
  let eventosProcesados: EventosProcesadosRepositoryEnMemoria;
  let handler: DescontarInsumoPorEventoHandler;

  const insumoId = '11111111-1111-1111-1111-111111111111';
  const eventoId = '22222222-2222-2222-2222-222222222222';

  beforeEach(async () => {
    insumos = new InsumoRepositoryEnMemoria();
    eventosProcesados = new EventosProcesadosRepositoryEnMemoria();
    handler = new DescontarInsumoPorEventoHandler(insumos, eventosProcesados);

    await insumos.guardar(
      Insumo.reconstituir({
        id: insumoId,
        codigo: 'INS-002',
        nombre: 'Morfina 10mg',
        medicamentoAsociado: 'Morfina',
        stockActual: 5,
        stockMinimo: 2,
      }),
    );
  });

  it('descuenta el stock del insumo correspondiente cuando coincide el medicamento', async () => {
    await handler.ejecutar(
      new DescontarInsumoPorEventoCommand({
        eventoId,
        medicamento: 'Morfina',
        cantidad: 2,
      }),
    );

    const guardado = await insumos.buscarPorId(insumoId);
    expect(guardado?.stockActual).toBe(3);
    expect(await eventosProcesados.haSidoProcesado(eventoId)).toBe(true);
  });

  it('es idempotente: si el evento ya fue procesado, no vuelve a descontar stock', async () => {
    await handler.ejecutar(
      new DescontarInsumoPorEventoCommand({
        eventoId,
        medicamento: 'Morfina',
        cantidad: 1,
      }),
    );

    // Segundo envío con el mismo eventoId
    await handler.ejecutar(
      new DescontarInsumoPorEventoCommand({
        eventoId,
        medicamento: 'Morfina',
        cantidad: 1,
      }),
    );

    const guardado = await insumos.buscarPorId(insumoId);
    expect(guardado?.stockActual).toBe(4); // Se descontó una sola vez
  });

  it('no falla si no existe insumo asociado al medicamento', async () => {
    await expect(
      handler.ejecutar(
        new DescontarInsumoPorEventoCommand({
          eventoId: '33333333-3333-3333-3333-333333333333',
          medicamento: 'MedicamentoInexistente',
          cantidad: 1,
        }),
      ),
    ).resolves.not.toThrow();
  });

  it('falla con StockInsuficiente si no hay stock disponible (stock no negativo)', async () => {
    await expect(
      handler.ejecutar(
        new DescontarInsumoPorEventoCommand({
          eventoId: '44444444-4444-4444-4444-444444444444',
          medicamento: 'Morfina',
          cantidad: 10,
        }),
      ),
    ).rejects.toThrow(StockInsuficiente);

    const guardado = await insumos.buscarPorId(insumoId);
    expect(guardado?.stockActual).toBe(5);
  });
});
