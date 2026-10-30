import type { AdministracionDeMedicacion } from '../../domain/administracion-medicacion';

export interface AdministracionMedicacionDto {
  id: string;
  indicacionId: string;
  pacienteId: string;
  medicamento: string;
  administradaEn: Date;
  administradaPor: string;
}

export const mapearAdministracionADto = (
  adm: AdministracionDeMedicacion,
): AdministracionMedicacionDto => ({
  id: adm.id,
  indicacionId: adm.indicacionId,
  pacienteId: adm.pacienteId,
  medicamento: adm.medicamento,
  administradaEn: adm.administradaEn,
  administradaPor: adm.administradaPor,
});

