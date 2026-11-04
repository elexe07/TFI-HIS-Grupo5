export interface AlergiaDto {
  id: string;
  sustancia: string;
  severidad: string;
  registradoEn: string;
  registradoPor: string;
}

export interface AntecedenteFamiliarDto {
  id: string;
  parentesco: string;
  condicion: string;
  registradoEn: string;
  registradoPor: string;
}

export interface EvolucionDto {
  id: string;
  medicoId: string;
  motivo: string;
  diagnostico: string;
  tratamiento?: string;
  registradoEn: string;
  turnoId?: string;
  internacionId?: string;
}

export interface PrescripcionDto {
  id: string;
  medicoId: string;
  medicamento: string;
  dosis: string;
  frecuenciaHoras: number;
  duracionDias: number;
  estado: string;
  creadoEn: string;
  evolucionId?: string;
}

export interface EstudioDto {
  id: string;
  tipo: string;
  descripcion: string;
  fecha: string;
  registradoPor: string;
  resultado?: string;
  creadoEn: string;
}

export interface HistoriaClinicaDto {
  id: string;
  pacienteId: string;
  creadoEn: string;
  alergias: AlergiaDto[];
  antecedentes: AntecedenteFamiliarDto[];
  evoluciones: EvolucionDto[];
  prescripciones: PrescripcionDto[];
  estudios: EstudioDto[];
}

