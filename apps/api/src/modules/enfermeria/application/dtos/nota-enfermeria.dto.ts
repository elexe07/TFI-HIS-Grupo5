import type { NotaDeEnfermeria } from '../../domain/nota-enfermeria';

export interface NotaEnfermeriaDto {
  id: string;
  pacienteId: string;
  internacionId: string | null;
  texto: string;
  registradoEn: Date;
  registradoPor: string;
}

export const mapearNotaADto = (nota: NotaDeEnfermeria): NotaEnfermeriaDto => ({
  id: nota.id,
  pacienteId: nota.pacienteId,
  internacionId: nota.internacionId,
  texto: nota.texto,
  registradoEn: nota.registradoEn,
  registradoPor: nota.registradoPor,
});

