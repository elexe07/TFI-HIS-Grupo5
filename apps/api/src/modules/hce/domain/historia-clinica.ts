import { AggregateRoot, generarId } from '../../../building-blocks/domain';
import {
  Alergia,
  AntecedenteFamiliar,
  Evolucion,
  Estudio,
  Prescripcion,
  type SeveridadAlergia,
  type TipoEstudio,
} from './entidades';
import { AlergiaDuplicada, PacienteAlergicoAMedicamento } from './errores';
import { EvolucionRegistrada, PrescripcionCreada } from './events/hce-events';

export class HistoriaClinica extends AggregateRoot {
  private readonly _alergias: Alergia[];
  private readonly _antecedentes: AntecedenteFamiliar[];
  private readonly _evoluciones: Evolucion[];
  private readonly _prescripciones: Prescripcion[];
  private readonly _estudios: Estudio[];

  private constructor(
    id: string,
    readonly pacienteId: string,
    readonly creadoEn: Date,
    readonly origenEventoId?: string,
    alergias: Alergia[] = [],
    antecedentes: AntecedenteFamiliar[] = [],
    evoluciones: Evolucion[] = [],
    prescripciones: Prescripcion[] = [],
    estudios: Estudio[] = [],
  ) {
    super(id);
    this._alergias = [...alergias];
    this._antecedentes = [...antecedentes];
    this._evoluciones = [...evoluciones];
    this._prescripciones = [...prescripciones];
    this._estudios = [...estudios];
  }

  static abrir(pacienteId: string, ahora: Date, origenEventoId?: string): HistoriaClinica {
    return new HistoriaClinica(generarId(), pacienteId, ahora, origenEventoId);
  }

  static reconstituir(
    id: string,
    pacienteId: string,
    creadoEn: Date,
    origenEventoId?: string,
    alergias: Alergia[] = [],
    antecedentes: AntecedenteFamiliar[] = [],
    evoluciones: Evolucion[] = [],
    prescripciones: Prescripcion[] = [],
    estudios: Estudio[] = [],
  ): HistoriaClinica {
    return new HistoriaClinica(
      id,
      pacienteId,
      creadoEn,
      origenEventoId,
      alergias,
      antecedentes,
      evoluciones,
      prescripciones,
      estudios,
    );
  }

  get alergias(): readonly Alergia[] {
    return this._alergias;
  }

  get antecedentes(): readonly AntecedenteFamiliar[] {
    return this._antecedentes;
  }

  get evoluciones(): readonly Evolucion[] {
    return this._evoluciones;
  }

  get prescripciones(): readonly Prescripcion[] {
    return this._prescripciones;
  }

  get estudios(): readonly Estudio[] {
    return this._estudios;
  }

  registrarAlergia(sustancia: string, severidad: SeveridadAlergia, ahora: Date, registradoPor: string): Alergia {
    const yaExiste = this._alergias.some(
      (a) => a.sustancia.toLowerCase() === sustancia.trim().toLowerCase(),
    );
    if (yaExiste) {
      throw new AlergiaDuplicada(sustancia);
    }

    const alergia = Alergia.crear(sustancia, severidad, ahora, registradoPor);
    this._alergias.push(alergia);
    return alergia;
  }

  registrarAntecedente(parentesco: string, condicion: string, ahora: Date, registradoPor: string): AntecedenteFamiliar {
    const antecedente = AntecedenteFamiliar.crear(parentesco, condicion, ahora, registradoPor);
    this._antecedentes.push(antecedente);
    return antecedente;
  }

  registrarEvolucion(
    medicoId: string,
    motivo: string,
    diagnostico: string,
    ahora: Date,
    tratamiento?: string,
    turnoId?: string,
    internacionId?: string,
  ): Evolucion {
    const evolucion = Evolucion.crear(medicoId, motivo, diagnostico, ahora, tratamiento, turnoId, internacionId);
    this._evoluciones.push(evolucion);

    this.registrarEvento(
      new EvolucionRegistrada(
        evolucion.id,
        this.pacienteId,
        medicoId,
        ahora,
        turnoId,
        internacionId,
      ),
    );

    return evolucion;
  }

  crearPrescripcion(
    medicoId: string,
    medicamento: string,
    dosis: string,
    frecuenciaHoras: number,
    duracionDias: number,
    ahora: Date,
    evolucionId?: string,
    internacionId?: string,
  ): Prescripcion {
    // Validar si el paciente es alérgico
    const tieneAlergia = this._alergias.some((a) =>
      medicamento.toLowerCase().includes(a.sustancia.toLowerCase()) ||
      a.sustancia.toLowerCase().includes(medicamento.toLowerCase()),
    );
    if (tieneAlergia) {
      throw new PacienteAlergicoAMedicamento(medicamento);
    }

    const prescripcion = Prescripcion.crear(
      medicoId,
      medicamento,
      dosis,
      frecuenciaHoras,
      duracionDias,
      ahora,
      evolucionId,
    );
    this._prescripciones.push(prescripcion);

    this.registrarEvento(
      new PrescripcionCreada(
        prescripcion.id,
        this.pacienteId,
        medicamento,
        dosis,
        frecuenciaHoras,
        duracionDias,
        ahora,
        internacionId,
      ),
    );

    return prescripcion;
  }

  registrarEstudio(
    tipo: TipoEstudio,
    descripcion: string,
    fecha: Date,
    registradoPor: string,
    ahora: Date,
    resultado?: string,
  ): Estudio {
    const estudio = Estudio.crear(tipo, descripcion, fecha, registradoPor, ahora, resultado);
    this._estudios.push(estudio);
    return estudio;
  }
}

