import { Cargo } from '../../domain/cargo';
import { Cuenta } from '../../domain/cuenta';
import { ConceptoCargo, TipoCuenta } from '../../domain/enums';
import { CuentaNoEncontrada } from '../../domain/errores';
import { CuentaRepositoryEnMemoria } from '../../testing';
import { ConsultarCuentaHandler } from './consultar-cuenta.handler';

describe('ConsultarCuentaHandler', () => {
  let handler: ConsultarCuentaHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    handler = new ConsultarCuentaHandler(cuentaRepo);
  });

  it('debería retornar el detalle completo de la cuenta y sus cargos', async () => {
    const cuenta = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-1',
      porcentajeCobertura: 80,
    });
    cuenta.agregarCargo(
      Cargo.crear({
        cuentaId: cuenta.id,
        concepto: ConceptoCargo.CONSULTA,
        descripcion: 'Consulta con especialista',
        cantidad: 1,
        montoUnitario: 20000,
        origenEventoId: 'evt-1',
      }),
    );
    await cuentaRepo.guardar(cuenta);

    const dto = await handler.ejecutar({ cuentaId: cuenta.id });

    expect(dto.id).toBe(cuenta.id);
    expect(dto.totalBruto).toBe(20000);
    expect(dto.totalDescuento).toBe(16000);
    expect(dto.totalAPagar).toBe(4000);
    expect(dto.cargos).toHaveLength(1);
  });

  it('debería lanzar CuentaNoEncontrada si el id no existe', async () => {
    await expect(handler.ejecutar({ cuentaId: 'no-existe' })).rejects.toThrow(CuentaNoEncontrada);
  });
});
