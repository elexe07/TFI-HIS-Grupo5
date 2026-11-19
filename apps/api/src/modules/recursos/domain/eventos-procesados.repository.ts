export const EVENTOS_PROCESADOS_REPOSITORY = Symbol('EventosProcesadosRepository');

export interface EventosProcesadosRepository {
  haSidoProcesado(eventoId: string): Promise<boolean>;
  registrarProcesado(eventoId: string): Promise<void>;
}
