import { ErrorDeValidacion } from '../../../building-blocks/domain';
import { Cargo } from './cargo';
import { ConceptoCargo } from './enums';

describe('Cargo', () => {
  const cuentaId = '00000000-0000-0000-0000-000000000001';
  const origenEventoId = '00000000-0000-0000-0000-000000000002';

  it('debería crear un cargo correctamente y calcular el monto total', () => {
    const cargo = Cargo.crear({
      cuentaId,
      concepto: ConceptoCargo.CONSULTA,
      descripcion: 'Consulta clínica médica',
      cantidad: 2,
      montoUnitario: 1500.5,
      origenEventoId,
    });

    expect(cargo.id).toBeDefined();
    expect(cargo.cuentaId).toBe(cuentaId);
    expect(cargo.concepto).toBe(ConceptoCargo.CONSULTA);
    expect(cargo.descripcion).toBe('Consulta clínica médica');
    expect(cargo.cantidad).toBe(2);
    expect(cargo.montoUnitario).toBe(1500.5);
    expect(cargo.montoTotal).toBe(3001);
    expect(cargo.origenEventoId).toBe(origenEventoId);
  });

  it('debería fallar si la cantidad es menor o igual a cero', () => {
    expect(() =>
      Cargo.crear({
        cuentaId,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Ibuprofeno 400mg',
        cantidad: 0,
        montoUnitario: 500,
        origenEventoId,
      }),
    ).toThrow(ErrorDeValidacion);
  });

  it('debería fallar si la cantidad no es entera', () => {
    expect(() =>
      Cargo.crear({
        cuentaId,
        concepto: ConceptoCargo.MEDICACION,
        descripcion: 'Ibuprofeno 400mg',
        cantidad: 1.5,
        montoUnitario: 500,
        origenEventoId,
      }),
    ).toThrow(ErrorDeValidacion);
  });

  it('debería fallar si el monto unitario es negativo', () => {
    expect(() =>
      Cargo.crear({
        cuentaId,
        concepto: ConceptoCargo.DIA_CAMA,
        descripcion: 'Día de internación',
        cantidad: 1,
        montoUnitario: -100,
        origenEventoId,
      }),
    ).toThrow(ErrorDeValidacion);
  });

  it('debería fallar si la descripción está en blanco', () => {
    expect(() =>
      Cargo.crear({
        cuentaId,
        concepto: ConceptoCargo.CONSULTA,
        descripcion: '   ',
        cantidad: 1,
        montoUnitario: 1000,
        origenEventoId,
      }),
    ).toThrow(ErrorDeValidacion);
  });
});

