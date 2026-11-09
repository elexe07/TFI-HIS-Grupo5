import { CantidadInvalida, StockInsuficiente } from './errores';
import { Insumo } from './insumo';

describe('Insumo', () => {
  const insumoId = '33333333-3333-3333-3333-333333333333';
  const codigo = 'INS-001';
  const nombre = 'Paracetamol 500mg';

  it('debería crearse correctamente con los datos iniciales', () => {
    const insumo = Insumo.crear({
      id: insumoId,
      codigo,
      nombre,
      medicamentoAsociado: 'Paracetamol',
      stockActual: 10,
      stockMinimo: 5,
    });

    expect(insumo.id).toBe(insumoId);
    expect(insumo.codigo).toBe(codigo);
    expect(insumo.nombre).toBe(nombre);
    expect(insumo.medicamentoAsociado).toBe('Paracetamol');
    expect(insumo.stockActual).toBe(10);
    expect(insumo.stockMinimo).toBe(5);
    expect(insumo.estaBajoMinimo()).toBe(false);
  });

  it('debería rechazar creación con stock inicial negativo', () => {
    expect(() =>
      Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: -1,
        stockMinimo: 5,
      }),
    ).toThrow(CantidadInvalida);
  });

  describe('Ingreso de stock (REC-05)', () => {
    it('debería sumar la cantidad al stock actual', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 10,
        stockMinimo: 5,
      });

      insumo.ingresar(15);
      expect(insumo.stockActual).toBe(25);
    });

    it('debería lanzar CantidadInvalida si la cantidad a ingresar es cero o negativa', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 10,
        stockMinimo: 5,
      });

      expect(() => insumo.ingresar(0)).toThrow(CantidadInvalida);
      expect(() => insumo.ingresar(-5)).toThrow(CantidadInvalida);
    });
  });

  describe('Descuento de stock (REC-06)', () => {
    it('debería descontar la cantidad si hay stock suficiente', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 10,
        stockMinimo: 5,
      });

      insumo.descontar(4);
      expect(insumo.stockActual).toBe(6);
    });

    it('debería permitir descontar hasta dejar el stock en exactamente cero', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 5,
        stockMinimo: 2,
      });

      insumo.descontar(5);
      expect(insumo.stockActual).toBe(0);
      expect(insumo.estaBajoMinimo()).toBe(true);
    });

    it('debería lanzar StockInsuficiente si se intenta descontar más de lo disponible (stock no negativo)', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 3,
        stockMinimo: 2,
      });

      expect(() => insumo.descontar(4)).toThrow(StockInsuficiente);
      expect(insumo.stockActual).toBe(3); // Invariante no modificada
    });

    it('debería lanzar CantidadInvalida si la cantidad a descontar es menor o igual a cero', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 10,
        stockMinimo: 5,
      });

      expect(() => insumo.descontar(0)).toThrow(CantidadInvalida);
      expect(() => insumo.descontar(-2)).toThrow(CantidadInvalida);
    });
  });

  describe('Insumos bajo mínimo (REC-07)', () => {
    it('debería identificar correctamente cuando está bajo mínimo', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 5,
        stockMinimo: 5,
      });

      expect(insumo.estaBajoMinimo()).toBe(true); // stockActual <= stockMinimo
    });

    it('debería identificar cuando NO está bajo mínimo', () => {
      const insumo = Insumo.crear({
        id: insumoId,
        codigo,
        nombre,
        stockActual: 6,
        stockMinimo: 5,
      });

      expect(insumo.estaBajoMinimo()).toBe(false);
    });
  });
});
