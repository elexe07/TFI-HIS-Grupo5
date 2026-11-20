import { CantidadInvalida, Insumo, InsumoYaExiste, MedicamentoYaAsociado } from '../../domain';
import { InsumoRepositoryEnMemoria } from '../../testing';
import { RegistrarInsumoCommand } from './registrar-insumo.command';
import { RegistrarInsumoHandler } from './registrar-insumo.handler';

describe('RegistrarInsumoHandler', () => {
  let insumos: InsumoRepositoryEnMemoria;
  let handler: RegistrarInsumoHandler;

  const datos = {
    codigo: 'ibu400',
    nombre: 'Ibuprofeno 400 mg',
    medicamentoAsociado: 'Ibuprofeno',
    stockInicial: 50,
    stockMinimo: 10,
  };

  beforeEach(async () => {
    insumos = new InsumoRepositoryEnMemoria();
    handler = new RegistrarInsumoHandler(insumos);
    await insumos.guardar(
      Insumo.reconstituir({
        id: '11111111-1111-1111-1111-111111111111',
        codigo: 'AMOX500',
        nombre: 'Amoxicilina 500 mg',
        medicamentoAsociado: 'Amoxicilina',
        stockActual: 10,
        stockMinimo: 5,
      }),
    );
  });

  it('da de alta el insumo con su stock inicial', async () => {
    const creado = await handler.ejecutar(new RegistrarInsumoCommand(datos));

    expect(creado).toMatchObject({ codigo: 'IBU400', stockActual: 50, bajoMinimo: false });
    expect(await insumos.buscarPorCodigo('IBU400')).not.toBeNull();
  });

  it('no permite dos insumos con el mismo código', async () => {
    await expect(
      handler.ejecutar(new RegistrarInsumoCommand({ ...datos, codigo: 'amox500' })),
    ).rejects.toThrow(InsumoYaExiste);
  });

  it('no permite asociar un medicamento que ya tiene otro insumo', async () => {
    await expect(
      handler.ejecutar(
        new RegistrarInsumoCommand({ ...datos, medicamentoAsociado: 'amoxicilina' }),
      ),
    ).rejects.toThrow(MedicamentoYaAsociado);
  });

  it('rechaza stock negativo', async () => {
    await expect(
      handler.ejecutar(new RegistrarInsumoCommand({ ...datos, stockInicial: -1 })),
    ).rejects.toThrow(CantidadInvalida);
  });
});
