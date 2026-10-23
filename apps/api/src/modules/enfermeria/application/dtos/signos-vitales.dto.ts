import type { SignosVitales } from '../../domain/signos-vitales';

export interface SignosVitalesDto {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  temperatura: number | null;
  presionSistolica: number | null;
  presionDiastolica: number | null;
  frecuenciaCardiaca: number | null;
  saturacionO2: number | null;
  registradoEn: Date;
  registradoPor: string;
}

export const mapearSignosVitalesADto = (sv: SignosVitales): SignosVitalesDto => ({
  id: sv.id,
  pacienteId: sv.pacienteId,
  internacionId: sv.internacionId,
  temperatura: sv.temperatura,
  presionSistolica: sv.presionSistolica,
  presionDiastolica: sv.presionDiastolica,
  frecuenciaCardiaca: sv.frecuenciaCardiaca,
  saturacionO2: sv.saturacionO2,
  registradoEn: sv.registradoEn,
  registradoPor: sv.registradoPor,
});

