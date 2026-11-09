import { PERMISOS, type UsuarioAutenticado } from '../../iam/public';
import { Cuenta } from '../domain/cuenta';
import { TipoCuenta } from '../domain/enums';
import { ConsultarCuentaHandler } from '../application/consultar-cuenta/consultar-cuenta.handler';
import { ListarCuentasPacienteHandler } from '../application/listar-cuentas-paciente/listar-cuentas-paciente.handler';
import { CuentaRepositoryEnMemoria } from '../testing';
import { CuentasController } from './cuentas.controller';

describe('CuentasController', () => {
  let controller: CuentasController;
  let cuentaRepo: CuentaRepositoryEnMemoria;

  beforeEach(() => {
    cuentaRepo = new CuentaRepositoryEnMemoria();
    const consultarHandler = new ConsultarCuentaHandler(cuentaRepo);
    const listarHandler = new ListarCuentasPacienteHandler(cuentaRepo);
    controller = new CuentasController(consultarHandler, listarHandler);
  });

  it('debería retornar las cuentas del paciente', async () => {
    const cuenta = Cuenta.abrir({
      pacienteId: 'pac-1',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-1',
    });
    await cuentaRepo.guardar(cuenta);

    const usuarioAdmin: UsuarioAutenticado = {
      id: 'admin-id',
      email: 'admin@his.local',
      nombre: 'Admin',
      rol: 'ADMINISTRADOR',
      permisos: [PERMISOS.FACTURACION_LEER],
    };

    const res = await controller.listar({ pacienteId: 'pac-1' }, usuarioAdmin);
    expect(res).toHaveLength(1);
    expect(res[0]?.id).toBe(cuenta.id);
  });

  it('si el usuario es PACIENTE, debería listar únicamente sus propias cuentas', async () => {
    const cuentaPropia = Cuenta.abrir({
      pacienteId: 'pac-mio',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-mio',
    });
    const cuentaAjena = Cuenta.abrir({
      pacienteId: 'pac-otro',
      tipo: TipoCuenta.CONSULTA,
      referenciaId: 'ref-otro',
    });
    await cuentaRepo.guardar(cuentaPropia);
    await cuentaRepo.guardar(cuentaAjena);

    const usuarioPaciente: UsuarioAutenticado = {
      id: 'pac-mio',
      email: 'paciente@his.local',
      nombre: 'Juan Paciente',
      rol: 'PACIENTE',
      permisos: [PERMISOS.FACTURACION_LEER],
    };

    // Intenta pedir cuentas de otro paciente en la query
    const res = await controller.listar({ pacienteId: 'pac-otro' }, usuarioPaciente);
    expect(res).toHaveLength(1);
    expect(res[0]?.id).toBe(cuentaPropia.id);
  });
});
