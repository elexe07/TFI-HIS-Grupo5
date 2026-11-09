import { Cuenta } from '../domain/cuenta';
import { TipoCuenta } from '../domain/enums';
import type { CuentaRepository } from '../domain/ports/cuenta.repository';

export class CuentaRepositoryEnMemoria implements CuentaRepository {
  private cuentas = new Map<string, Cuenta>();

  async buscarPorId(id: string): Promise<Cuenta | null> {
    const cuenta = this.cuentas.get(id);
    return cuenta ? this.clonar(cuenta) : null;
  }

  async buscarPorTipoYReferencia(tipo: TipoCuenta, referenciaId: string): Promise<Cuenta | null> {
    for (const cuenta of this.cuentas.values()) {
      if (cuenta.tipo === tipo && cuenta.referenciaId === referenciaId) {
        return this.clonar(cuenta);
      }
    }
    return null;
  }

  async listarPorPaciente(pacienteId: string): Promise<Cuenta[]> {
    const res: Cuenta[] = [];
    for (const cuenta of this.cuentas.values()) {
      if (cuenta.pacienteId === pacienteId) {
        res.push(this.clonar(cuenta));
      }
    }
    return res;
  }

  async listarTodas(): Promise<Cuenta[]> {
    return Array.from(this.cuentas.values()).map((c) => this.clonar(c));
  }

  async guardar(cuenta: Cuenta): Promise<void> {
    this.cuentas.set(cuenta.id, this.clonar(cuenta));
  }

  async existeCargoConOrigenEvento(origenEventoId: string): Promise<boolean> {
    for (const cuenta of this.cuentas.values()) {
      if (cuenta.tieneCargoConOrigenEvento(origenEventoId)) {
        return true;
      }
    }
    return false;
  }

  private clonar(cuenta: Cuenta): Cuenta {
    return Cuenta.rehidratar(
      cuenta.id,
      cuenta.pacienteId,
      cuenta.tipo,
      cuenta.referenciaId,
      cuenta.coberturaValidada,
      cuenta.porcentajeCobertura,
      cuenta.estado,
      cuenta.createdAt,
      cuenta.updatedAt,
      [...cuenta.cargos],
    );
  }
}
