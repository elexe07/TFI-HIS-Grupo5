import type {
  ConsultorDeOcupacion,
  ResumenOcupacion,
} from '../domain/ports/consultor-de-ocupacion';

export class ConsultorDeOcupacionFalso implements ConsultorDeOcupacion {
  constructor(
    private resumen: ResumenOcupacion = {
      totalCamas: 20,
      ocupadas: 12,
      libres: 5,
      enLimpieza: 2,
      bloqueadas: 1,
      porcentajeOcupacion: 60,
    },
  ) {}

  async consultarOcupacion(): Promise<ResumenOcupacion> {
    return { ...this.resumen };
  }

  setResumen(nuevo: ResumenOcupacion): void {
    this.resumen = { ...nuevo };
  }
}

