export interface PropsRegistrarNotaEnfermeria {
  readonly pacienteId: string;
  readonly texto: string;
  readonly registradoPor: string;
  readonly internacionId?: string | null;
}

export class RegistrarNotaEnfermeriaCommand {
  readonly pacienteId: string;
  readonly texto: string;
  readonly registradoPor: string;
  readonly internacionId: string | null;

  constructor(props: PropsRegistrarNotaEnfermeria) {
    this.pacienteId = props.pacienteId;
    this.texto = props.texto;
    this.registradoPor = props.registradoPor;
    this.internacionId = props.internacionId ?? null;
  }
}

