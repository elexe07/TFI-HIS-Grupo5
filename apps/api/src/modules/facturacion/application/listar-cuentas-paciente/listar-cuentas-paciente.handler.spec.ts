import { Cuenta } from '../../domain/cuenta';
import { TipoCuenta } from '../../domain/enums';
import { CuentaRepositoryEnMemoria } from '../../testing';
import { ListarCuentasPacienteHandler } from './listar-cuentas-paciente.handler';

describe('ListarCuentasPacienteHandler', () => {
  let handler: ListarCuentasPacienteHandler;
  let cuentaRepo: CuentaRepositoryEnMemoria;

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    handler = new ListarCuentasPacienteHandler(cuentaRepo);
  });

  it('debería retornar todas las cuentas del paciente', async () => {
    const c1 = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-1',
    });
    const c2 = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.INTERNACION,
      referenciaId: 'ref-2',
    });
    const c3 = Cuenta.abrir({
      pacienteId: 'pac-otro',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-3',
    });

    await cuentaRepo.guardar(c1);
    await cuentaRepo.guardar(c2);
    await cuentaRepo.guardar(c3);

    const lista = await handler.ejecutar({ pacienteId: 'pac-1' });

    expect(lista).toHaveLength(2);
    expect(lista.map((x) => x.id)).toEqual(expect.arrayContaining([c1.id, c2.id]));
  });
});

