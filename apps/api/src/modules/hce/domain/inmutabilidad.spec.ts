import { HistoriaClinicaRepositoryEnMemoria } from '../infrastructure/historia-clinica.repository.en-memoria';
import { HistoriaClinicaRepositoryPrisma } from '../infrastructure/historia-clinica.repository.prisma';

describe('Inmutabilidad de la HCE (ADR-008)', () => {
  it('el repositorio en memoria no debe exponer métodos de actualización ni borrado de evoluciones', () => {
    const proto = HistoriaClinicaRepositoryEnMemoria.prototype as any;
    expect(proto.actualizarEvolucion).toBeUndefined();
    expect(proto.eliminarEvolucion).toBeUndefined();
    expect(proto.actualizarAntecedente).toBeUndefined();
    expect(proto.eliminarAntecedente).toBeUndefined();
    expect(proto.eliminar).toBeUndefined();
    expect(proto.update).toBeUndefined();
    expect(proto.delete).toBeUndefined();
  });

  it('el repositorio Prisma no debe exponer métodos de actualización ni borrado de evoluciones', () => {
    const proto = HistoriaClinicaRepositoryPrisma.prototype as any;
    expect(proto.actualizarEvolucion).toBeUndefined();
    expect(proto.eliminarEvolucion).toBeUndefined();
    expect(proto.actualizarAntecedente).toBeUndefined();
    expect(proto.eliminarAntecedente).toBeUndefined();
    expect(proto.eliminar).toBeUndefined();
    expect(proto.update).toBeUndefined();
    expect(proto.delete).toBeUndefined();
  });
});
