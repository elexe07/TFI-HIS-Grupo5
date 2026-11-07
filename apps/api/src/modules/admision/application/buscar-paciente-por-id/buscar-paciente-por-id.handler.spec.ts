import { Documento } from '../../domain/documento';
import { PacienteNoEncontrado } from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { BuscarPacientePorIdHandler } from './buscar-paciente-por-id.handler';
import { BuscarPacientePorIdQuery } from './buscar-paciente-por-id.query';

describe('BuscarPacientePorIdHandler', () => {
  let repo: PacienteRepositoryEnMemoria;
  let handler: BuscarPacientePorIdHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');

  beforeEach(() => {
    repo = new PacienteRepositoryEnMemoria();
    handler = new BuscarPacientePorIdHandler(repo);
  });

  it('debería devolver el paciente si existe', async () => {
    const paciente = Paciente.crear(
      {
        documento: Documento.crear(TipoDocumento.DNI, '99887766'),
        nombre: 'Ana',
        apellido: 'López',
        fechaNacimiento: new Date('1992-04-12'),
        sexo: Sexo.F,
      },
      ahora,
    );
    await repo.guardar(paciente);

    const res = await handler.ejecutar(new BuscarPacientePorIdQuery(paciente.id));
    expect(res.id).toBe(paciente.id);
    expect(res.nombre).toBe('Ana');
  });

  it('debería lanzar PacienteNoEncontrado si no existe', async () => {
    await expect(handler.ejecutar(new BuscarPacientePorIdQuery('inexistente'))).rejects.toThrow(
      PacienteNoEncontrado,
    );
  });
});
