import { RelojFijo } from '../../../../building-blocks/testing';
import { Documento } from '../../domain/documento';
import { NivelTriajeInvalido, PacienteNoEncontrado } from '../../domain/errores';
import { Paciente } from '../../domain/paciente';
import { EstadoTriaje, NivelTriaje, Sexo, TipoDocumento } from '../../domain/tipos';
import { PacienteRepositoryEnMemoria } from '../../testing/paciente.repository.en-memoria';
import { TriajeRepositoryEnMemoria } from '../../testing/triaje.repository.en-memoria';
import { RegistrarTriajeCommand } from './registrar-triaje.command';
import { RegistrarTriajeHandler } from './registrar-triaje.handler';

describe('RegistrarTriajeHandler (ADM-06)', () => {
  let triajeRepo: TriajeRepositoryEnMemoria;
  let pacienteRepo: PacienteRepositoryEnMemoria;
  let handler: RegistrarTriajeHandler;
  const ahora = new Date('2026-10-23T10:00:00Z');
  let pacienteId: string;

  beforeEach(async () => {
    triajeRepo = new TriajeRepositoryEnMemoria();
    pacienteRepo = new PacienteRepositoryEnMemoria();
    handler = new RegistrarTriajeHandler(triajeRepo, pacienteRepo, new RelojFijo(ahora));

    const paciente = Paciente.crear(
      {
        documento: Documento.crear(TipoDocumento.DNI, '55667788'),
        nombre: 'Martín',
        apellido: 'Palermo',
        fechaNacimiento: new Date('1973-11-07'),
        sexo: Sexo.M,
      },
      ahora,
    );
    await pacienteRepo.guardar(paciente);
    pacienteId = paciente.id;
  });

  it('debería registrar un triaje con nivel y motivo', async () => {
    const res = await handler.ejecutar(
      new RegistrarTriajeCommand({
        pacienteId,
        nivel: NivelTriaje.NARANJA,
        motivo: 'Dificultad respiratoria aguda',
        registradoPor: 'enf-1',
      }),
    );

    expect(res.id).toBeDefined();
    expect(res.nivel).toBe(NivelTriaje.NARANJA);
    expect(res.prioridad).toBe(2);
    expect(res.estado).toBe(EstadoTriaje.EN_ESPERA);

    const guardado = await triajeRepo.buscarPorId(res.id);
    expect(guardado).not.toBeNull();
    expect(guardado?.nivel).toBe(NivelTriaje.NARANJA);
  });

  it('debería fallar si el nivel es inválido', async () => {
    await expect(
      handler.ejecutar(
        new RegistrarTriajeCommand({
          pacienteId,
          nivel: 'NIVEL_INEXISTENTE' as NivelTriaje,
          motivo: 'Dolor de cabeza',
          registradoPor: 'enf-1',
        }),
      ),
    ).rejects.toThrow(NivelTriajeInvalido);
  });

  it('debería fallar si el paciente no existe', async () => {
    await expect(
      handler.ejecutar(
        new RegistrarTriajeCommand({
          pacienteId: 'inexistente',
          nivel: NivelTriaje.VERDE,
          motivo: 'Control de presión',
          registradoPor: 'enf-1',
        }),
      ),
    ).rejects.toThrow(PacienteNoEncontrado);
  });
});

