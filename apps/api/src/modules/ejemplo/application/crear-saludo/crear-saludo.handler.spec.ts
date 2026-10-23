import { EventBusEnMemoria, RelojFijo } from '../../../../building-blocks/testing';
import { SALUDO_CREADO } from '../../domain/events/saludo-creado';
import { NombreInvalido } from '../../domain/nombre';
import { SaludoRepositoryEnMemoria } from '../../infrastructure/saludo.repository.en-memoria';
import { CrearSaludoCommand } from './crear-saludo.command';
import { CrearSaludoHandler } from './crear-saludo.handler';

describe('CrearSaludoHandler', () => {
  let repo: SaludoRepositoryEnMemoria;
  let bus: EventBusEnMemoria;
  let handler: CrearSaludoHandler;

  beforeEach(() => {
    repo = new SaludoRepositoryEnMemoria();
    bus = new EventBusEnMemoria();
    handler = new CrearSaludoHandler(repo, bus, new RelojFijo());
  });

  it('guarda el saludo y devuelve el mensaje', async () => {
    const resultado = await handler.ejecutar(new CrearSaludoCommand('Ana'));

    expect(resultado.mensaje).toBe('Hola, Ana');
    expect(await repo.listar()).toHaveLength(1);
  });

  it('publica SaludoCreado después de guardar', async () => {
    await handler.ejecutar(new CrearSaludoCommand('Ana'));

    expect(bus.nombres()).toEqual([SALUDO_CREADO]);
  });

  it('no guarda ni publica nada si el nombre es inválido', async () => {
    await expect(handler.ejecutar(new CrearSaludoCommand('  '))).rejects.toThrow(NombreInvalido);

    expect(await repo.listar()).toHaveLength(0);
    expect(bus.publicados).toHaveLength(0);
  });
});
