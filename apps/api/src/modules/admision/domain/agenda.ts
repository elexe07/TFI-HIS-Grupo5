import { Entity, generarId } from '../../../building-blocks/domain';
import { FranjaHorariaInvalida, FranjasSolapadas } from './errores';

export interface PropsFranjaAgenda {
  id?: string;
  medicoId: string;
  diaSemana: number; // 0 domingo .. 6 sábado
  horaInicio: string; // "HH:mm"
  horaFin: string; // "HH:mm"
  duracionTurnoMin: number;
}

export function parsearMinutos(horaStr: string): number {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const match = regex.exec(horaStr?.trim() ?? '');
  if (!match) {
    throw new FranjaHorariaInvalida(
      `Formato de hora inválido: "${horaStr}". Debe ser HH:mm (00:00 a 23:59)`,
    );
  }
  const [, h, m] = match;
  return Number(h) * 60 + Number(m);
}

function obtenerMinutosDelDia(d: Date, usarUtc: boolean): { dia: number; minutos: number } {
  const dia = usarUtc ? d.getUTCDay() : d.getDay();
  const h = usarUtc ? d.getUTCHours() : d.getHours();
  const m = usarUtc ? d.getUTCMinutes() : d.getMinutes();
  return { dia, minutos: h * 60 + m };
}

export class FranjaAgenda {
  readonly id: string;
  readonly medicoId: string;
  readonly diaSemana: number;
  readonly horaInicio: string;
  readonly horaFin: string;
  readonly duracionTurnoMin: number;

  private readonly inicioMinutos: number;
  private readonly finMinutos: number;

  constructor(props: PropsFranjaAgenda) {
    if (props.diaSemana < 0 || props.diaSemana > 6 || !Number.isInteger(props.diaSemana)) {
      throw new FranjaHorariaInvalida(
        'El día de la semana debe ser un entero entre 0 (domingo) y 6 (sábado)',
      );
    }
    if (props.duracionTurnoMin <= 0 || !Number.isInteger(props.duracionTurnoMin)) {
      throw new FranjaHorariaInvalida(
        'La duración del turno debe ser un entero positivo en minutos',
      );
    }

    this.inicioMinutos = parsearMinutos(props.horaInicio);
    this.finMinutos = parsearMinutos(props.horaFin);

    if (this.finMinutos <= this.inicioMinutos) {
      throw new FranjaHorariaInvalida('La hora de fin debe ser posterior a la hora de inicio');
    }

    this.id = props.id ?? generarId();
    this.medicoId = props.medicoId;
    this.diaSemana = props.diaSemana;
    this.horaInicio = props.horaInicio.trim();
    this.horaFin = props.horaFin.trim();
    this.duracionTurnoMin = props.duracionTurnoMin;
  }

  seSolapaCon(otra: FranjaAgenda): boolean {
    if (this.diaSemana !== otra.diaSemana) return false;
    return this.inicioMinutos < otra.finMinutos && otra.inicioMinutos < this.finMinutos;
  }

  cubreTurno(inicio: Date, fin: Date, usarUtc = true): boolean {
    const tInicio = obtenerMinutosDelDia(inicio, usarUtc);
    const tFin = obtenerMinutosDelDia(fin, usarUtc);

    if (tInicio.dia !== this.diaSemana || tFin.dia !== this.diaSemana) return false;
    return tInicio.minutos >= this.inicioMinutos && tFin.minutos <= this.finMinutos;
  }
}

export class AgendaMedico extends Entity {
  private readonly franjas: FranjaAgenda[];

  private constructor(medicoId: string, franjas: FranjaAgenda[]) {
    super(medicoId);
    this.franjas = franjas;
  }

  static crear(
    medicoId: string,
    franjasProps: Omit<PropsFranjaAgenda, 'medicoId'>[],
  ): AgendaMedico {
    const franjas = franjasProps.map((p) => new FranjaAgenda({ ...p, medicoId }));

    // Validar que no haya solapamiento entre franjas del mismo día
    for (let i = 0; i < franjas.length; i++) {
      const actual = franjas[i];
      if (!actual) continue;
      for (let j = i + 1; j < franjas.length; j++) {
        const otra = franjas[j];
        if (otra && actual.seSolapaCon(otra)) {
          throw new FranjasSolapadas();
        }
      }
    }

    return new AgendaMedico(medicoId, franjas);
  }

  static reconstituir(medicoId: string, franjas: FranjaAgenda[]): AgendaMedico {
    return new AgendaMedico(medicoId, franjas);
  }

  get medicoId(): string {
    return this.id;
  }

  obtenerFranjas(): readonly FranjaAgenda[] {
    return [...this.franjas];
  }

  permiteTurno(inicio: Date, fin: Date, usarUtc = true): boolean {
    return this.franjas.some((f) => f.cubreTurno(inicio, fin, usarUtc));
  }
}
