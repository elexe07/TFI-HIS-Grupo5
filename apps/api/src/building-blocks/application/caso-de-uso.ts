/**
 * Todo caso de uso (comando o query) implementa esta interfaz.
 * Un caso de uso = un archivo = una clase = un método `ejecutar`.
 */
export interface CasoDeUso<TEntrada, TSalida> {
  ejecutar(entrada: TEntrada): Promise<TSalida>;
}
