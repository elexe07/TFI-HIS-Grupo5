import { ErrorDeValidacion } from '../../../building-blocks/domain';
import { Cargo } from './cargo';
import { Cuenta } from './cuenta';
import { ConceptoCargo, EstadoCuenta, TipoCuenta } from './enums';
import { CargoDuplicado, CuentaYaCerrada } from './errores';

describe('Cuenta', () => {
  const pacienteId = '00000000-0000-0000-0000-000000000001';
  const referenciaId = '00000000-0000-0000-0000-000000000002';
  const ahora = new Date('2026-10-23T10:00:00Z');

  it('debería abrir una cuenta en estado ABIERTA', () => {
    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.CONSULTA,
      referenciaId,
      ahora,
    });

    expect(cuenta.id).toBeDefined();
    expect(cuenta.pacienteId).toBe(pacienteId);
    expect(cuenta.tipo).toBe(TipoCuenta.CONSULTA);
    expect(cuenta.referenciaId).toBe(referenciaId);
    expect(cuenta.estado).toBe(EstadoCuenta.ABIERTA);
    expect(cuenta.cargos).toHaveLength(0);
    expect(cuenta.calcularTotalBruto()).toBe(0);
    expect(cuenta.calcularTotalAPagar()).toBe(0);
  });

  it('debería agregar cargos y calcular montos con descuento de cobertura', () => {
    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.INTERNACION,
      referenciaId,
      porcentajeCobertura: 80, // OSDE 80%
      ahora,
    });

    const cargo1 = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.CONSULTA,
      descripcion: 'Consulta Médica',
      cantidad: 1,
      montoUnitario: 1000,
      origenEventoId: 'evt-1',
    });

    const cargo2 = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.MEDICACION,
      descripcion: 'Medicación A',
      cantidad: 2,
      montoUnitario: 500,
      origenEventoId: 'evt-2',
    });

    cuenta.agregarCargo(cargo1);
    cuenta.agregarCargo(cargo2);

    expect(cuenta.cargos).toHaveLength(2);
    expect(cuenta.calcularTotalBruto()).toBe(2000);
    expect(cuenta.calcularTotalDescuento()).toBe(1600); // 80% de 2000
    expect(cuenta.calcularTotalAPagar()).toBe(400); // 2000 - 1600
  });

  it('debería rechazar cargos duplicados por el mismo origen_evento_id', () => {
    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.CONSULTA,
      referenciaId,
    });

    const cargo = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.CONSULTA,
      descripcion: 'Consulta Médica',
      cantidad: 1,
      montoUnitario: 1000,
      origenEventoId: 'evt-mismo-id',
    });

    cuenta.agregarCargo(cargo);

    expect(() => cuenta.agregarCargo(cargo)).toThrow(CargoDuplicado);
  });

  it('debería rechazar agregar cargos si la cuenta está CERRADA', () => {
    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.CONSULTA,
      referenciaId,
    });

    cuenta.cerrar();
    expect(cuenta.estado).toBe(EstadoCuenta.CERRADA);

    const cargo = Cargo.crear({
      cuentaId: cuenta.id,
      concepto: ConceptoCargo.CONSULTA,
      descripcion: 'Consulta Médica',
      cantidad: 1,
      montoUnitario: 1000,
      origenEventoId: 'evt-3',
    });

    expect(() => cuenta.agregarCargo(cargo)).toThrow(CuentaYaCerrada);
  });

  it('debería validar rangos de cobertura al aplicar cobertura', () => {
    const cuenta = Cuenta.abrir({
      pacienteId,
      tipo: TipoCuenta.CONSULTA,
      referenciaId,
    });

    expect(() => cuenta.aplicarCobertura(150)).toThrow(ErrorDeValidacion);
    expect(() => cuenta.aplicarCobertura(-5)).toThrow(ErrorDeValidacion);

    cuenta.aplicarCobertura(50);
    expect(cuenta.coberturaValidada).toBe(true);
    expect(cuenta.porcentajeCobertura).toBe(50);
  });
});

