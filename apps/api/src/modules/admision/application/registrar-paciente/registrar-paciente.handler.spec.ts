import { EventBusEnMemoria, RelojFijo } from '../../../../building-blocks/testing';
import { PacienteYaExiste } from '../../domain/errores';
import { EVENTO_PACIENTE_REGISTRADO } from '../../domain/events/paciente-registrado';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { RegistrarPacienteCommand } from './registrar-paciente.command';
import { RegistrarPacienteHandler } from './registrar-paciente.handler';

describe('RegistrarPacienteHandler (ADM-01)', () => {
  let repo: PacienteRepositoryEnMemoria;
  let bus: EventBusEnMemoria;
  let reloj: RelojFijo;
  let handler: RegistrarPacienteHandler;

  beforeEach(() => {
    repo = new PacienteRepositoryEnMemoria();
    bus = new EventBusEnMemoria();
    reloj = new RelojFijo(new Date('2026-10-23T10:00:00Z'));
    handler = new RegistrarPacienteHandler(repo, bus, reloj);
  });

  const datosValidos = {
    tipoDocumento: TipoDocumento.DNI,
    numeroDocumento: '40123456',
    nombre: 'Laura',
    apellido: 'Martínez',
    fechaNacimiento: '1995-03-20',
    sexo: Sexo.F,
    telefono: '1133445566',
    email: 'laura@test.com',
    obraSocialCodigo: 'OSDE',
    numeroAfiliado: '778899',
  };

  it('debería registrar un paciente y publicar PacienteRegistrado', async () => {
    const res = await handler.ejecutar(new RegistrarPacienteCommand(datosValidos));

    expect(res.id).toBeDefined();
    expect(res.nombre).toBe('Laura');
    expect(res.apellido).toBe('Martínez');
    expect(res.numeroDocumento).toBe('40123456');
    expect(res.tipoDocumento).toBe(TipoDocumento.DNI);

    const guardado = await repo.buscarPorId(res.id);
    expect(guardado).not.toBeNull();
    expect(guardado?.documento.numero).toBe('40123456');

    expect(bus.nombres()).toEqual([EVENTO_PACIENTE_REGISTRADO]);
  });

  it('debería fallar si el documento ya está registrado para ese tipo', async () => {
    await handler.ejecutar(new RegistrarPacienteCommand(datosValidos));

    await expect(handler.ejecutar(new RegistrarPacienteCommand(datosValidos))).rejects.toThrow(
      PacienteYaExiste,
    );

    expect(bus.nombres()).toHaveLength(1); // No publica segundo evento
  });
});
