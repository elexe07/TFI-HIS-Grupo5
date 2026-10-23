import type { Cuenta } from '../cuenta';
import type { TipoCuenta } from '../enums';

export const CUENTA_REPOSITORY = Symbol('CUENTA_REPOSITORY');

export interface CuentaRepository {
  buscarPorId(id: string): Promise<Cuenta | null>;
  buscarPorTipoYReferencia(tipo: TipoCuenta, referenciaId: string): Promise<Cuenta | null>;
  listarPorPaciente(pacienteId: string): Promise<Cuenta[]>;
  guardar(cuenta: Cuenta): Promise<void>;
  existeCargoConOrigenEvento(origenEventoId: string): Promise<boolean>;
}

