import { Documento } from '../../domain/documento';
import { Paciente } from '../../domain/paciente';
import { Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { BuscarPacientesHandler } from './buscar-pacientes.handler';
import { BuscarPacientesQuery } from './buscar-pacientes.query';

describe('BuscarPacientesHandler (ADM-02)', () => {
  let repo: PacienteRepositoryEnMemoria;
  let handler: BuscarPacientesHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');

  beforeEach(async () => {
    repo = new PacienteRepositoryEnMemoria();
    handler = new BuscarPacientesHandler(repo);

    await repo.guardar(
      Paciente.crear(
        {
          documento: Documento.crear(TipoDocumento.DNI, '11112222'),
          nombre: 'María',
          apellido: 'Gómez',
          fechaNacimiento: new Date('1988-01-01'),
          sexo: Sexo.F,
        },
        ahora,
      ),
    );

    await repo.guardar(
      Paciente.crear(
        {
          documento: Documento.crear(TipoDocumento.DNI, '33334444'),
          nombre: 'Carlos',
          apellido: 'González',
          fechaNacimiento: new Date('1975-06-10'),
          sexo: Sexo.M,
        },
        ahora,
      ),
    );
  });

  it('debería buscar por apellido', async () => {
    const res = await handler.ejecutar(new BuscarPacientesQuery({ apellido: 'gómez' }));
    expect(res).toHaveLength(1);
    expect(res[0]?.apellido).toBe('Gómez');
  });

  it('debería buscar por documento', async () => {
    const res = await handler.ejecutar(new BuscarPacientesQuery({ documento: '3333' }));
    expect(res).toHaveLength(1);
    expect(res[0]?.numeroDocumento).toBe('33334444');
  });

  it('debería devolver todos si no se pasan filtros', async () => {
    const res = await handler.ejecutar(new BuscarPacientesQuery());
    expect(res).toHaveLength(2);
  });

  it('un paciente solo se encuentra a sí mismo', async () => {
    const propio = Paciente.crear(
      {
        usuarioId: 'usuario-paciente',
        documento: Documento.crear(TipoDocumento.DNI, '30111222'),
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: new Date('1990-05-15'),
        sexo: Sexo.M,
      },
      ahora,
    );
    await repo.guardar(propio);

    const lista = await handler.ejecutar(
      new BuscarPacientesQuery({}, { usuarioId: 'usuario-paciente', esPaciente: true }),
    );

    expect(lista.map((p) => p.id)).toEqual([propio.id]);
  });
});
