export interface EventosProcesadosRepository {
  haSidoProcesado(eventoId: string): Promise<boolean>;
  registrarProcesado(eventoId: string): Promise<void>;
}
