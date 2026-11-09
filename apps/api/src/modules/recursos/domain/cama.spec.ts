import { Cama, EstadoCama } from './cama';
import { TransicionDeCamaInvalida } from './errores';

describe('Cama', () => {
  const camaId = '11111111-1111-1111-1111-111111111111';
  const habitacionId = '22222222-2222-2222-2222-222222222222';
  const codigo = 'CM-101A';

  it('debería crearse en estado LIBRE por defecto si no se indica estado', () => {
    const cama = Cama.crear({ id: camaId, habitacionId, codigo });
    expect(cama.estado).toBe(EstadoCama.LIBRE);
    expect(cama.codigo).toBe(codigo);
    expect(cama.habitacionId).toBe(habitacionId);
  });

  describe('Transiciones válidas', () => {
    const transicionesValidas: [EstadoCama, EstadoCama, (cama: Cama) => void][] = [
      [EstadoCama.LIBRE, EstadoCama.OCUPADA, (c) => c.ocupar()],
      [EstadoCama.OCUPADA, EstadoCama.EN_LIMPIEZA, (c) => c.marcarEnLimpieza()],
      [EstadoCama.EN_LIMPIEZA, EstadoCama.LIBRE, (c) => c.marcarLimpia()],
      [EstadoCama.LIBRE, EstadoCama.BLOQUEADA, (c) => c.bloquear()],
      [EstadoCama.BLOQUEADA, EstadoCama.LIBRE, (c) => c.desbloquear()],
    ];

    it.each(transicionesValidas)(
      'debería permitir la transición válida de %s a %s',
      (origen, destino, transicionar) => {
        const cama = Cama.reconstituir({
          id: camaId,
          habitacionId,
          codigo,
          estado: origen,
          updatedAt: new Date(),
        });

        transicionar(cama);
        expect(cama.estado).toBe(destino);
      },
    );
  });

  describe('Transiciones inválidas', () => {
    const todasLasTransiciones: [EstadoCama, EstadoCama][] = [
      [EstadoCama.LIBRE, EstadoCama.LIBRE],
      [EstadoCama.LIBRE, EstadoCama.EN_LIMPIEZA],
      [EstadoCama.OCUPADA, EstadoCama.LIBRE],
      [EstadoCama.OCUPADA, EstadoCama.OCUPADA],
      [EstadoCama.OCUPADA, EstadoCama.BLOQUEADA],
      [EstadoCama.EN_LIMPIEZA, EstadoCama.OCUPADA],
      [EstadoCama.EN_LIMPIEZA, EstadoCama.EN_LIMPIEZA],
      [EstadoCama.EN_LIMPIEZA, EstadoCama.BLOQUEADA],
      [EstadoCama.BLOQUEADA, EstadoCama.OCUPADA],
      [EstadoCama.BLOQUEADA, EstadoCama.EN_LIMPIEZA],
      [EstadoCama.BLOQUEADA, EstadoCama.BLOQUEADA],
    ];

    it.each(todasLasTransiciones)(
      'debería lanzar TransicionDeCamaInvalida al intentar pasar de %s a %s',
      (desde, hacia) => {
        const cama = Cama.reconstituir({
          id: camaId,
          habitacionId,
          codigo,
          estado: desde,
          updatedAt: new Date(),
        });

        expect(() => cama.cambiarEstado(hacia)).toThrow(TransicionDeCamaInvalida);
      },
    );
  });
});
